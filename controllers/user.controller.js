import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};
export const register = async (req, res, next) => {
  const { fullName, email, password } = req.body || {};

  if (!fullName || !email || !password) {
    return next(new AppError("Please provide all required fields", 400));
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("Email already exists", 400));
    }

    // Create new user
    const user = new User({ fullName, email, password });

    // Hash password (if not handled in schema)
    if (typeof user.hashPassword === "function") {
      await user.hashPassword();
    }

    await user.save();

    // Generate JWT
    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  try {
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Wrong password", 401));
    }

    // Generate JWT
    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
export const logout = async (req, res, next) => {
  try {
    // Clear the cookie
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// export const updateProfile = async (req, res, next) => {
//   try {
//     console.log(req.body.fullName);
//     const { fullName, email } = req.body;
//     const userId = req.user.id;

//     // Check if email is being updated and if it already exists
//     if (email) {
//       const existingUser = await User.findOne({ email, _id: { $ne: userId } });
//       if (existingUser) {
//         return next(new AppError("Email already exists", 400));
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         ...(fullName && { fullName }),
//         ...(email && { email }),
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return next(new AppError("User not found", 404));
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         id: updatedUser._id,
//         fullName: updatedUser.fullName,
//         email: updatedUser.email,
//         role: updatedUser.role,
//         createdAt: updatedUser.createdAt,
//         updatedAt: updatedUser.updatedAt,
//       },
//     });
//   } catch (error) {
//     return next(new AppError(error.message, 500));
//   }
// };
export const updateProfile = async (req, res, next) => {
  try {
    // Log for debugging
    console.log('Body:', req.body);
    console.log('Params ID:', req.params.id);
    console.log('Token User ID:', req.user.id);
    
    const { fullName, email } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!fullName || !email) {
      return next(new AppError("Name and email are required", 400));
    }

    // Security check
    if (userId !== req.user.id) {
      return next(new AppError("Unauthorized", 403));
    }

    // Check duplicate email
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return next(new AppError("Email already exists", 400));
    }

    // Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    return next(new AppError(error.message, 500));
  }
};