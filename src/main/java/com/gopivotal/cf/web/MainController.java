package com.gopivotal.cf.web;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.gopivotal.objects.Greeting;
import com.gopivotal.objects.User;

@CrossOrigin(origins = "http://movies-api.cfapps.io")
@Controller
public class MainController {

    private final AtomicLong counter = new AtomicLong();
    private final String DEFAULT_NAME = "Guest";
    private final String DEFAULT_COUNTRY = "USA";
    private User user;
	
	@RequestMapping("/")
	public String main() {
		return "login";
	}

    @RequestMapping("/greeting")
    public Greeting greeting(@RequestParam(value="name", defaultValue="Guest") String name) {
        return new Greeting(counter.incrementAndGet(),
                            String.format("Hello %s,", name));
    }
    
    @RequestMapping(value = "/postlogin", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public String loggedIn(Model model, @RequestBody User user) {
    	
    	this.user = new User();
    	if(user != null && user.getName() != null && !user.getName().isEmpty()){
    		this.user.setName(user.getName());
    	} else {
    		this.user.setName(DEFAULT_NAME); //Default name
    	}
    	if(user != null && user.getCountry() != null && !user.getCountry().isEmpty()){
    		this.user.setCountry(user.getCountry());
    	} else {
    		this.user.setCountry(DEFAULT_COUNTRY); //Default Country
    	}
    	
    	return "redirect:/home";
    }
    
    @RequestMapping(value = "/home", method=RequestMethod.GET)
    public String showHome( Model model){
    	
    	String greeting = String.format("Hello %s", user.getName());
    	model.addAttribute("greeting", greeting);
    	
    	model.addAttribute("name", user.getName());
    	return "home";
    }
    
    @RequestMapping("/movies/index.html")
    public String showMovies() {
        return "movies/index";
    }
    
    @RequestMapping("/directives/add-movie.html")
    public String addMovie() {
        return "directives/add-movie";
    }
    
    @RequestMapping("/directives/pagination.html")
    public String addPagination() {
        return "directives/pagination";
    }
    
    @RequestMapping("/directives/delete-dialogue.html")
    public String deleteMovieDialog() {
        return "directives/delete-dialogue";
    }
    
    @RequestMapping("/templates/movies/_movie.html")
    public String showMovie() {
        return "movies/_movie";
    }
    
    @RequestMapping("/templates/movies/_movie-editing.html")
    public String editMovie() {
        return "movies/_movie-editing";
    }
    
    @RequestMapping("/templates/movies/_movie-details.html")
    public String showMovieDetails() {
        return "movies/_movie-details";
    }
}

