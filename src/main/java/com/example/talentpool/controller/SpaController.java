package com.example.talentpool.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/backoffice",
            "/backoffice/**"
    })
    public String forwardBackoffice() {
        return "forward:/index.html";
    }

    @GetMapping({
            "/talent",
            "/talent/"
    })
    public String forwardTalentPortal() {
        return "forward:/talent/index.html";
    }
}
