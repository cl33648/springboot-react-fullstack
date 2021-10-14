package com.example.demo.integration;

import com.example.demo.student.Gender;
import com.example.demo.student.Student;
import com.example.demo.student.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.javafaker.Faker;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

                    //annotation to make this class integration test with Spring Boot
@SpringBootTest     //When application starts up, and fire some requests to student repo
@TestPropertySource(
        locations = "classpath:application-it.properties"
)
@AutoConfigureMockMvc
public class StudentIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    private final Faker faker = new Faker();

    @Test
    void canRegisterNewStudent() throws Exception {
        //given
        String name = String.format(
                "%s %s",
                faker.name().firstName(),
                faker.name().lastName()
        );

        Student student = new Student(
                name,
                String.format("%s@gmail.com", name.toLowerCase()).replaceAll("\\s", ""),
                Gender.FEMALE
        );

        //when
        ResultActions resultActions = mockMvc.perform(
                post("/api/v1/students")                          //testing POST Mapping request for adding student
                        .contentType(MediaType.APPLICATION_JSON)            //content type passed is JSON Format
                        .content(objectMapper.writeValueAsString(student))  //request body of student
        );
        //then
        resultActions.andExpect(status().isOk());                           //expect the status to be 200 ok

        List<Student> students = studentRepository.findAll();               //get list of all students from postgre db
        assertThat(students).usingElementComparatorIgnoringFields("id")     //ignore id field, because id is randomly generated
                .contains(student);                                         //assert that added student is in the students
    }

    @Test
    void canDeleteStudent() throws Exception {
        //given
        String name = String.format(
                "%s %s",
                faker.name().firstName(),
                faker.name().lastName()
        );

        String email = String.format("%s@gmail.com", name.toLowerCase()).replaceAll("\\s", "");

        Student student = new Student(
                name,
                email,
                Gender.FEMALE
        );

        mockMvc.perform(
                post("/api/v1/students")                             //perform POST Mapping of student (add)
                        .contentType(MediaType.APPLICATION_JSON)                //content type passed is JSON Format
                        .content(objectMapper.writeValueAsString(student))      //request body of student
        );

        MvcResult getStudentsResult =
                mockMvc.perform(get("/api/v1/students")         //perform GET Mapping of student (getAllStudents)
                        .contentType(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andReturn();

        String contentAsString = getStudentsResult                         //String value of list of all students
                .getResponse()
                .getContentAsString();

        List<Student> students = objectMapper.readValue(                   //map the string value of students to List of Student objects
                contentAsString,
                new TypeReference<List<Student>>() {
                }
        );

        long id = students.stream()                                       //java stream through students to find
                .filter(s -> s.getEmail().equals(student.getEmail()))     //the id of student with corresponding email, used on post mapping
                .map(Student::getId)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "student with email: " + email + " not found"));


        // when
        ResultActions resultActions = mockMvc
                .perform(delete("/api/v1/students/" + id));

        // then
        resultActions.andExpect(status().isOk());
        boolean exists = studentRepository.existsById(id);
        assertThat(exists).isFalse();
    }

}
