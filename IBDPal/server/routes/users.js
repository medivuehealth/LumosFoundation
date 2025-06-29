const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login, u.email_verified,
              up.date_of_birth, up.gender, up.diagnosis_date, up.ibd_type,
              up.emergency_contact_name, up.emergency_contact_phone, up.emergency_contact_relationship
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        emailVerified: user.email_verified,
        profile: {
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          diagnosisDate: user.diagnosis_date,
          ibdType: user.ibd_type,
          emergencyContact: {
            name: user.emergency_contact_name,
            phone: user.emergency_contact_phone,
            relationship: user.emergency_contact_relationship
          }
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Unable to fetch user profile',
      message: 'Please try again.'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  body('diagnosisDate').optional().isISO8601().withMessage('Invalid diagnosis date format'),
  body('ibdType').optional().isIn(['Crohn\'s Disease', 'Ulcerative Colitis', 'Indeterminate Colitis']).withMessage('Invalid IBD type'),
  body('emergencyContact.name').optional().trim().isLength({ min: 1 }).withMessage('Emergency contact name cannot be empty'),
  body('emergencyContact.phone').optional().trim().isLength({ min: 10 }).withMessage('Invalid phone number'),
  body('emergencyContact.relationship').optional().trim().isLength({ min: 1 }).withMessage('Emergency contact relationship cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      diagnosisDate,
      ibdType,
      emergencyContact
    } = req.body;

    // Update user basic info
    if (firstName || lastName) {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (firstName) {
        updateFields.push(`first_name = $${paramCount++}`);
        updateValues.push(firstName);
      }
      if (lastName) {
        updateFields.push(`last_name = $${paramCount++}`);
        updateValues.push(lastName);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(userId);

      await db.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        updateValues
      );
    }

    // Update or create user profile
    const profileResult = await db.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length > 0) {
      // Update existing profile
      const profileUpdateFields = [];
      const profileUpdateValues = [];
      let paramCount = 1;

      if (dateOfBirth !== undefined) {
        profileUpdateFields.push(`date_of_birth = $${paramCount++}`);
        profileUpdateValues.push(dateOfBirth);
      }
      if (gender !== undefined) {
        profileUpdateFields.push(`gender = $${paramCount++}`);
        profileUpdateValues.push(gender);
      }
      if (diagnosisDate !== undefined) {
        profileUpdateFields.push(`diagnosis_date = $${paramCount++}`);
        profileUpdateValues.push(diagnosisDate);
      }
      if (ibdType !== undefined) {
        profileUpdateFields.push(`ibd_type = $${paramCount++}`);
        profileUpdateValues.push(ibdType);
      }
      if (emergencyContact) {
        if (emergencyContact.name !== undefined) {
          profileUpdateFields.push(`emergency_contact_name = $${paramCount++}`);
          profileUpdateValues.push(emergencyContact.name);
        }
        if (emergencyContact.phone !== undefined) {
          profileUpdateFields.push(`emergency_contact_phone = $${paramCount++}`);
          profileUpdateValues.push(emergencyContact.phone);
        }
        if (emergencyContact.relationship !== undefined) {
          profileUpdateFields.push(`emergency_contact_relationship = $${paramCount++}`);
          profileUpdateValues.push(emergencyContact.relationship);
        }
      }

      if (profileUpdateFields.length > 0) {
        profileUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        profileUpdateValues.push(userId);

        await db.query(
          `UPDATE user_profiles SET ${profileUpdateFields.join(', ')} WHERE user_id = $${paramCount}`,
          profileUpdateValues
        );
      }
    } else {
      // Create new profile
      await db.query(
        `INSERT INTO user_profiles (
          user_id, date_of_birth, gender, diagnosis_date, ibd_type,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          dateOfBirth || null,
          gender || null,
          diagnosisDate || null,
          ibdType || null,
          emergencyContact?.name || null,
          emergencyContact?.phone || null,
          emergencyContact?.relationship || null
        ]
      );
    }

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Unable to update profile',
      message: 'Please try again.'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'The current password you entered is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Unable to change password',
      message: 'Please try again.'
    });
  }
});

module.exports = router; 