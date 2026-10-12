package com.example.talentpool.controller;
import com.example.talentpool.service.PostalCodeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/public/postal-codes")
public class PostalCodeController {
    private final PostalCodeService service;
    public PostalCodeController(PostalCodeService service) {this.service=service;}
    @GetMapping public List<String> search(@RequestParam String code) {return service.search(code);}
}
