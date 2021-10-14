package com.example.demo.student;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.StudentNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    private StudentService underTest;

    @BeforeEach
    void setUp() {
        underTest = new StudentService(studentRepository);
    }

    @Test
    void getAllStudents() {
        //when
        underTest.getAllStudents();
        //then
        verify(studentRepository).findAll();    //mockito's verify() to verify findAll() method is invoked
    }

    @Test
    void canAddStudent() {
        // given
        String email = "jamila@gmail.com";
        Student student = new Student(
                "Jamila",
                email,
                Gender.FEMALE
        );

        //when
        underTest.addStudent(student);

        //then
        ArgumentCaptor<Student> studentArgumentCaptor = ArgumentCaptor.forClass(Student.class);

        verify(studentRepository).save(studentArgumentCaptor.capture()); //verify that student repository save method is invoked and capture the student argument value

        Student capturedStudent = studentArgumentCaptor.getValue();

        assertThat(capturedStudent).isEqualTo(student);
    }

    @Test
    void willThrowWhenEmailIsTaken() {
        // given
        String email = "jamila@gmail.com";
        Student student = new Student(
                "Jamila",
                email,
                Gender.FEMALE
        );

        given(studentRepository.selectByEmail(student.getEmail()))
                .willReturn(true);  //given that studentRepo's selectByEmail returns true

        //when
        //then
        assertThatThrownBy(() -> underTest.addStudent(student))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email "+student.getEmail()+" is already taken");

        verify(studentRepository, never()).save(any());
    }

    @Test
    void canDeleteStudent() {
        // given
        long id = 10;
        given(studentRepository.existsById(id))
                .willReturn(true);
        // when
        underTest.deleteStudent(id);

        // then
        verify(studentRepository).deleteById(id);
    }

    @Test
    void willThrowWhenDeleteStudentNotFound() {
        // given
        long id = 10;
        given(studentRepository.existsById(id))
                .willReturn(false);
        // when
        // then
        assertThatThrownBy(() -> underTest.deleteStudent(id))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining("Student with id " + id + " does not exist.");

        verify(studentRepository, never()).deleteById(any());
    }
}