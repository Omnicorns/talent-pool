package com.example.talentpool.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/open-positions",
            "/sign-in",
            "/register",
            "/portal",
            "/backoffice",
            "/backoffice/**",
            "/talent",
            "/talent/"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
