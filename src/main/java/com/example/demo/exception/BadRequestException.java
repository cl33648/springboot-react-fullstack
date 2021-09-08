package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST) //this will throw 400 error status to client
public class BadRequestException extends RuntimeException{

    public BadRequestException(String message) {
        super(message);
    }
}
