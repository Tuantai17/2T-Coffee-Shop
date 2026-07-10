package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByUserDetailsEmail(email);
    }

    @Override
    public User saveUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Dữ liệu đăng ký không hợp lệ.");
        }
        if (user.getUserName() == null || user.getUserName().isBlank()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống.");
        }
        if (user.getUserDetails() == null || user.getUserDetails().getEmail() == null || user.getUserDetails().getEmail().isBlank()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        if (userRepository.findByUserName(user.getUserName()) != null) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.findByUserDetailsEmail(user.getUserDetails().getEmail()) != null) {
            throw new IllegalArgumentException("Email đã tồn tại.");
        }
        user.setActive(1);
        UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_MEMBER");
        if (role == null) {
            role = new UserRole();
            role.setRoleName("ROLE_MEMBER");
            role = userRoleRepository.save(role);
        }
        user.setRole(role);
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setActive(userDetails.getActive());
            if (userDetails.getRole() != null) {
                UserRole role = userRoleRepository.findUserRoleByRoleName(userDetails.getRole().getRoleName());
                if (role != null) {
                    user.setRole(role);
                }
            }
            if (userDetails.getUserDetails() != null) {
                com.rainbowforest.userservice.entity.UserDetails details = user.getUserDetails();
                if (details == null) {
                    details = new com.rainbowforest.userservice.entity.UserDetails();
                }
                details.setFirstName(userDetails.getUserDetails().getFirstName());
                details.setLastName(userDetails.getUserDetails().getLastName());
                details.setEmail(userDetails.getUserDetails().getEmail());
                details.setPhoneNumber(userDetails.getUserDetails().getPhoneNumber());
                details.setAvatarUrl(userDetails.getUserDetails().getAvatarUrl());
                user.setUserDetails(details);
            }
            return userRepository.save(user);
        }
        return null;
    }

    @jakarta.annotation.PostConstruct
    public void initData() {
        // Migrate ROLE_USER → ROLE_MEMBER if exists
        migrateRoleUserToMember();

        createRoleIfNotExist("ROLE_ADMIN");
        createRoleIfNotExist("ROLE_MEMBER");
        createRoleIfNotExist("ROLE_STAFF");

        // Tạo tài khoản admin mặc định
        if (userRepository.findByUserName("admin") == null) {
            User admin = new User();
            admin.setUserName("admin");
            admin.setUserPassword(passwordEncoder.encode("123456"));
            admin.setActive(1);
            
            UserRole adminRole = userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN");
            admin.setRole(adminRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Quản lý");
            details.setLastName("Admin");
            details.setEmail("admin@beverage-shop.com");
            admin.setUserDetails(details);
            
            userRepository.save(admin);
            log.info(">>> Đã khởi tạo tài khoản admin mặc định (admin/123456)");
        }

        // Tạo tài khoản staff mặc định
        if (userRepository.findByUserName("staff") == null) {
            User staff = new User();
            staff.setUserName("staff");
            staff.setUserPassword(passwordEncoder.encode("123456"));
            staff.setActive(1);
            
            UserRole staffRole = userRoleRepository.findUserRoleByRoleName("ROLE_STAFF");
            staff.setRole(staffRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Nhân viên");
            details.setLastName("Staff");
            details.setEmail("staff@beverage-shop.com");
            staff.setUserDetails(details);
            
            userRepository.save(staff);
            log.info(">>> Đã khởi tạo tài khoản staff mặc định (staff/123456)");
        }

        // Tạo tài khoản member mẫu
        if (userRepository.findByUserName("member1") == null) {
            User member = new User();
            member.setUserName("member1");
            member.setUserPassword(passwordEncoder.encode("123456"));
            member.setActive(1);
            
            UserRole memberRole = userRoleRepository.findUserRoleByRoleName("ROLE_MEMBER");
            member.setRole(memberRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Nguyễn Văn");
            details.setLastName("A");
            details.setEmail("member1@example.com");
            details.setPhoneNumber("0901234567");
            member.setUserDetails(details);
            
            userRepository.save(member);
            log.info(">>> Đã khởi tạo tài khoản member mẫu (member1/123456)");
        }

        if (userRepository.findByUserName("member2") == null) {
            User member = new User();
            member.setUserName("member2");
            member.setUserPassword(passwordEncoder.encode("123456"));
            member.setActive(1);
            
            UserRole memberRole = userRoleRepository.findUserRoleByRoleName("ROLE_MEMBER");
            member.setRole(memberRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Trần Thị");
            details.setLastName("B");
            details.setEmail("member2@example.com");
            details.setPhoneNumber("0912345678");
            member.setUserDetails(details);
            
            userRepository.save(member);
            log.info(">>> Đã khởi tạo tài khoản member mẫu (member2/123456)");
        }

        if (userRepository.findByUserName("member3") == null) {
            User member = new User();
            member.setUserName("member3");
            member.setUserPassword(passwordEncoder.encode("123456"));
            member.setActive(1);
            
            UserRole memberRole = userRoleRepository.findUserRoleByRoleName("ROLE_MEMBER");
            member.setRole(memberRole);
            
            com.rainbowforest.userservice.entity.UserDetails details = new com.rainbowforest.userservice.entity.UserDetails();
            details.setFirstName("Lê Hoàng");
            details.setLastName("C");
            details.setEmail("member3@example.com");
            details.setPhoneNumber("0923456789");
            member.setUserDetails(details);
            
            userRepository.save(member);
            log.info(">>> Đã khởi tạo tài khoản member mẫu (member3/123456)");
        }
    }

    /**
     * Migrate existing ROLE_USER to ROLE_MEMBER.
     * This handles the transition from the old e-commerce domain to the beverage shop domain.
     * Safe: only renames, never deletes.
     */
    private void migrateRoleUserToMember() {
        UserRole oldRole = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        if (oldRole != null) {
            // Check if ROLE_MEMBER already exists
            UserRole existingMember = userRoleRepository.findUserRoleByRoleName("ROLE_MEMBER");
            if (existingMember == null) {
                // Rename ROLE_USER → ROLE_MEMBER (keeps all user associations)
                oldRole.setRoleName("ROLE_MEMBER");
                userRoleRepository.save(oldRole);
                log.info(">>> Migrated ROLE_USER → ROLE_MEMBER (role id={})", oldRole.getId());
            } else {
                log.info(">>> ROLE_MEMBER already exists, skipping migration");
            }
        }
    }

    private void createRoleIfNotExist(String roleName) {
        UserRole role = userRoleRepository.findUserRoleByRoleName(roleName);
        if (role == null) {
            role = new UserRole();
            role.setRoleName(roleName);
            userRoleRepository.save(role);
        }
    }

}
