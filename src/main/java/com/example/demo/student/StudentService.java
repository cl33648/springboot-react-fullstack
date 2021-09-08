package com.example.demo.student;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.StudentNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents(){
        return studentRepository.findAll();
    }

    public void addStudent(Student student) {
        //validate if email is not taken
        Boolean doesEmailExist =
                studentRepository.selectByEmail(student.getEmail());

        if(doesEmailExist){
            throw new BadRequestException("Email "+student.getEmail()+" is already taken");
        }

        studentRepository.save(student);
    }

    public void deleteStudent(Long studentId){
        //check if student exists
        if(!studentRepository.existsById(studentId)){
            throw new StudentNotFoundException("Student with id "+studentId+" does not exist.");
        }

        studentRepository.deleteById(studentId);
    }
}
