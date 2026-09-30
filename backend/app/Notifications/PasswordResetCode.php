<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Delivers a password reset code to the account's email address. The code is
 * never returned in an API response. With MAIL_MAILER=log (the default in
 * .env.example, and what the free-tier deployment uses because no mail
 * service is configured) the message is written to the server log only.
 */
class PasswordResetCode extends Notification
{
    use Queueable;

    public function __construct(public readonly string $code)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Alpha password reset code')
            ->line('Someone asked to reset the password for your Alpha account.')
            ->line("Your reset code is: {$this->code}")
            ->line('It expires in 24 hours. If you did not ask for this, you can ignore this email.');
    }
}
