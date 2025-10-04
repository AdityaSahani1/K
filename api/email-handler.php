<?php
// Email Handler using PHPMailer (via Composer)
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/env-loader.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailHandler {
    private $mail;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $this->fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'adityamsahani9819@gmail.com';
        $this->fromName = getenv('SMTP_FROM_NAME') ?: 'SnapSera';
        
        $this->mail = new PHPMailer(true);
        $this->setupSMTP();
    }
    
    private function setupSMTP() {
        // Server settings - use environment variables with fallbacks
        $this->mail->isSMTP();
        $this->mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = getenv('SMTP_USERNAME') ?: $this->fromEmail;
        $this->mail->Password   = getenv('SMTP_PASSWORD') ?: getenv('GMAIL_APP_PASSWORD');
        $this->mail->SMTPSecure = (getenv('SMTP_ENCRYPTION') === 'tls') ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $this->mail->Port       = getenv('SMTP_PORT') ?: 587;
        
        $this->mail->setFrom($this->fromEmail, $this->fromName);
        $this->mail->isHTML(true);
    }
    
    public function sendOTPEmail($toEmail, $toName, $otp) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($toEmail, $toName);
            
            $this->mail->Subject = 'Email Verification - SnapSera';
            
            $body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;'>
                <div style='background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                    <h1 style='color: white; margin: 0; font-size: 28px;'>Email Verification</h1>
                </div>
                
                <div style='background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;'>
                    <h2 style='color: #1f2937; margin-bottom: 20px;'>Hello {$toName},</h2>
                    
                    <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                        Thank you for signing up to SnapSera! To complete your registration, please verify your email address using the OTP code below:
                    </p>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <div style='display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;'>
                            {$otp}
                        </div>
                    </div>
                    
                    <p style='color: #6b7280; font-size: 14px; text-align: center; margin: 25px 0;'>
                        This OTP will expire in 10 minutes for security reasons.
                    </p>
                    
                    <p style='color: #4b5563; font-size: 14px; margin-top: 25px;'>
                        If you didn't request this verification, please ignore this email.
                    </p>
                    
                    <hr style='border: none; height: 1px; background-color: #e5e7eb; margin: 25px 0;'>
                    
                    <p style='color: #6b7280; font-size: 12px; text-align: center; margin: 0;'>
                        © 2025 SnapSera. All rights reserved.
                    </p>
                </div>
            </div>
            ";
            
            $this->mail->Body = $body;
            
            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendPasswordResetEmail($toEmail, $toName, $resetToken) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($toEmail, $toName);
            
            $this->mail->Subject = 'Password Reset - SnapSera';
            
            $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/reset-password.php?token=" . $resetToken;
            
            $body = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;'>
                <div style='background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
                    <h1 style='color: white; margin: 0; font-size: 28px;'>Password Reset</h1>
                </div>
                
                <div style='background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;'>
                    <h2 style='color: #1f2937; margin-bottom: 20px;'>Hello {$toName},</h2>
                    
                    <p style='color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;'>
                        We received a request to reset your password for your SnapSera account. Click the button below to reset your password:
                    </p>
                    
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{$resetLink}' style='display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; font-size: 16px; font-weight: bold; padding: 15px 30px; border-radius: 8px;'>
                            Reset Password
                        </a>
                    </div>
                    
                    <p style='color: #6b7280; font-size: 14px; text-align: center; margin: 25px 0;'>
                        This link will expire in 1 hour for security reasons.
                    </p>
                    
                    <p style='color: #4b5563; font-size: 14px; margin-top: 25px;'>
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                    
                    <hr style='border: none; height: 1px; background-color: #e5e7eb; margin: 25px 0;'>
                    
                    <p style='color: #6b7280; font-size: 12px; text-align: center; margin: 0;'>
                        © 2025 SnapSera. All rights reserved.
                    </p>
                </div>
            </div>
            ";
            
            $this->mail->Body = $body;
            
            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    public function sendContactEmail($name, $email, $subject, $message) {
        $emailsSent = [];
        $errors = [];
        
        // Send to admin
        try {
            $this->mail->clearAddresses();
            $this->mail->clearReplyTos();
            $this->mail->addAddress($this->fromEmail, $this->fromName);
            $this->mail->addReplyTo($email, $name);
            
            $this->mail->Subject = 'Contact: ' . $subject;
            
            $adminBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 8px 8px 0 0;'>
                    <h2 style='color: white; margin: 0;'>New Contact Message</h2>
                </div>
                <div style='background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;'>
                    <p><strong>From:</strong> {$name} ({$email})</p>
                    <p><strong>Subject:</strong> {$subject}</p>
                    <div style='background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 15px;'>
                        <p style='color: #4b5563; margin: 0;'>" . nl2br(htmlspecialchars($message)) . "</p>
                    </div>
                </div>
            </div>
            ";
            
            $this->mail->Body = $adminBody;
            $this->mail->send();
            $emailsSent[] = 'admin';
        } catch (Exception $e) {
            $errors[] = "Admin email failed: " . $e->getMessage();
            error_log("Admin email failed: " . $this->mail->ErrorInfo);
        }
        
        // Send confirmation to sender
        try {
            $this->mail->clearAddresses();
            $this->mail->clearReplyTos();
            $this->mail->addAddress($email, $name);
            $this->mail->Subject = 'Message Received - ' . $subject;
            
            $senderBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 8px 8px 0 0;'>
                    <h2 style='color: white; margin: 0;'>Message Received</h2>
                </div>
                <div style='background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;'>
                    <p>Hi {$name},</p>
                    <p>Thanks for reaching out! I received your message and will respond soon.</p>
                    <div style='background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;'>
                        <p style='color: #4b5563; margin: 0;'>" . nl2br(htmlspecialchars($message)) . "</p>
                    </div>
                    <p style='color: #6b7280; font-size: 12px;'>© 2025 Artistry Studio</p>
                </div>
            </div>
            ";
            
            $this->mail->Body = $senderBody;
            $this->mail->send();
            $emailsSent[] = 'sender';
        } catch (Exception $e) {
            $errors[] = "Sender email failed: " . $e->getMessage();
            error_log("Sender email failed: " . $this->mail->ErrorInfo);
        }
        
        // Return true only if at least the admin email was sent
        if (in_array('admin', $emailsSent)) {
            return true;
        }
        
        return false;
    }
}
?>