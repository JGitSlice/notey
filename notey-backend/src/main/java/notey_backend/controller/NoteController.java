package notey_backend.controller;

import notey_backend.entity.Note;
import notey_backend.repository.NoteRepository;
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
import java.util.List;

@RestController
@RequestMapping("/notes")
@CrossOrigin("*")
public class NoteController {

    private final NoteRepository noteRepository;

    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @GetMapping
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteRepository.save(note);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }

    @GetMapping("/user/{email}")
    public List<Note> getUserNotes(@PathVariable String email) {
        return noteRepository.findByUserEmail(email);
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws IOException {

        Path filePath = Paths.get(
                System.getProperty("user.dir"),
                "uploads"
        ).resolve(fileName);

        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\""
                )
                .body(resource);
    }

    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    @PutMapping("/update-with-pdf/{id}")
    public Note updateNoteWithPdf(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("subject") String subject,
            @RequestParam("semester") int semester,
            @RequestParam("description") String description,
            @RequestParam(value = "pdf", required = false) MultipartFile pdf
    ) throws IOException {

        Note note = noteRepository.findById(id).orElse(null);

        if (note != null) {
            note.setTitle(title);
            note.setSubject(subject);
            note.setSemester(semester);
            note.setDescription(description);

            if (pdf != null && !pdf.isEmpty()) {
                String uploadDir = System.getProperty("user.dir") + "/uploads/";

                File directory = new File(uploadDir);

                if (!directory.exists()) {
                    directory.mkdirs();
                }

                String fileName = pdf.getOriginalFilename();

                File file = new File(uploadDir + fileName);

                pdf.transferTo(file);

                note.setPdfFileName(fileName);
            }

            return noteRepository.save(note);
        }

        return null;
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id,
                           @RequestBody Note updatedNote) {

        Note note = noteRepository.findById(id).orElse(null);

        if (note != null) {

            note.setTitle(updatedNote.getTitle());
            note.setSubject(updatedNote.getSubject());
            note.setSemester(updatedNote.getSemester());
            note.setDescription(updatedNote.getDescription());

            return noteRepository.save(note);
        }

        return null;
    }

    @PostMapping("/upload")
    public Note uploadNote(

            @RequestParam("title") String title,
            @RequestParam("subject") String subject,
            @RequestParam("semester") int semester,
            @RequestParam("description") String description,
            @RequestParam("userEmail") String userEmail,
            @RequestParam("pdf") MultipartFile pdf

    ) throws IOException {

        String uploadDir =
                System.getProperty("user.dir") + "/uploads/";

        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = pdf.getOriginalFilename();

        File file = new File(uploadDir + fileName);

        pdf.transferTo(file);

        Note note = new Note();

        note.setTitle(title);
        note.setSubject(subject);
        note.setSemester(semester);
        note.setDescription(description);
        note.setUserEmail(userEmail);
        note.setPdfFileName(fileName);

        return noteRepository.save(note);
    }
}