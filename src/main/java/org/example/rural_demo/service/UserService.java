package org.example.rural_demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.example.rural_demo.dto.LoginDTO;
import org.example.rural_demo.dto.RegisterDTO;
import org.example.rural_demo.entity.User;

public interface UserService extends IService<User> {

    User login(LoginDTO loginDTO);

    void register(RegisterDTO registerDTO);

    String getUserNameById(Long id);
}