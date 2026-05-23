package notey_backend.controller;

import notey_backend.entity.User;
import notey_backend.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()) != null) {
            return "Email already exists!";
        }

        userRepository.save(user);

        return "User registered successfully!";
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody User loginData) {

        User user = userRepository.findByEmail(loginData.getEmail());

        if (user == null) {
            return "User not found!";
        }

        if (!user.getPassword().equals(loginData.getPassword())) {
            return "Invalid password!";
        }

        return "Login successful!";
    }

    @GetMapping("/user/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email);
    }

    @PutMapping("/user/{email}")
    public User updateUser(@PathVariable String email,
                           @RequestBody User updatedUser) {

        User user = userRepository.findByEmail(email);

        if (user != null) {
            user.setUsername(updatedUser.getUsername());
            return userRepository.save(user);
        }

        return null;
    }

    @PutMapping("/reset-password/{email}")
    public String resetPassword(
            @PathVariable String email,
            @RequestBody User passwordData
    ) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return "User not found!";
        }

        if (!user.getPassword().equals(
                passwordData.getPassword()
        )) {
            return "Current password is incorrect!";
        }

        user.setPassword(passwordData.getUsername());

        userRepository.save(user);

        return "Password updated successfully!";
    }

    @PostMapping("/profile-pic/{email}")
    public User uploadProfilePic(
            @PathVariable String email,
            @RequestParam("profilePic") MultipartFile profilePic
    ) throws IOException {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return null;
        }

        String uploadDir =
                System.getProperty("user.dir")
                        + "/uploads/profile-pics/";

        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = profilePic.getOriginalFilename();

        File file = new File(uploadDir + fileName);

        profilePic.transferTo(file);

        user.setProfilePic(fileName);

        return userRepository.save(user);
    }

    @GetMapping("/profile-pic/{fileName}")
    public ResponseEntity<Resource> getProfilePic(
            @PathVariable String fileName
    ) throws IOException {

        Path filePath = Paths.get(
                System.getProperty("user.dir"),
                "uploads",
                "profile-pics"
        ).resolve(fileName);

        Resource resource =
                new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\""
                                + resource.getFilename()
                                + "\""
                )
                .body(resource);
    }
}