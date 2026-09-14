import { sendEmailViaWorkflow } from '../../../gateways/external/email.adapter';
import { createEmailWorkflow } from '../setup/setup-workflows.usecase';
import type { SendEmailRequestDto } from '../../../types/dto/request/send-email-request.dto';

export async function sendEmailUsecase(payload: SendEmailRequestDto) {
  const { to, subject, body, html, cc, bcc, replyTo } = payload;

  if (!to || (Array.isArray(to) ? to.length === 0 : !to)) {
    throw new Error('Recipient email address(es) required');
  }

  if (!subject || !subject.trim()) {
    throw new Error('Email subject is required');
  }

  if (!body || !body.trim()) {
    throw new Error('Email body is required');
  }

  console.log('📧 Processing email send request');

  try {
    const result = await sendEmailViaWorkflow({
      to,
      subject,
      body,
      html,
      cc,
      bcc,
      replyTo,
    });

    return {
      success: true,
      message: 'Email sent successfully',
      result,
    };
  } catch (error: any) {
    if (error?.message?.includes('Email webhook not found')) {
      console.log(
        '📧 Email workflow not found; creating one before retrying...',
      );
      await createEmailWorkflow();
      const result = await sendEmailViaWorkflow({
        to,
        subject,
        body,
        html,
        cc,
        bcc,
        replyTo,
      });

      return {
        success: true,
        message: 'Email workflow created and email sent successfully',
        result,
      };
    }

    throw error;
  }
}
