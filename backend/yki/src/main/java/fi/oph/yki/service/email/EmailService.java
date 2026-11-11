package fi.oph.yki.service.email;

import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailAttachment;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.repository.EmailAttachmentRepository;
import fi.oph.yki.repository.EmailListProjection;
import fi.oph.yki.repository.EmailRepository;
import fi.oph.yki.service.email.sender.EmailSender;
import fi.oph.yki.util.exception.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailService {

  private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

  private final EmailRepository emailRepository;
  private final EmailAttachmentRepository emailAttachmentRepository;
  private final EmailSender emailSender;

  @Transactional
  public Long saveEmail(final EmailType type, final EmailData emailData) {
    final Email email = new Email();
    email.setEmailType(type);
    email.setRecipientName(emailData.recipientName());
    email.setRecipientAddress(emailData.recipientAddress());
    email.setSubject(emailData.subject());
    email.setBody(emailData.body());

    emailData
      .attachments()
      .forEach(emailAttachmentData -> {
        final EmailAttachment emailAttachment = new EmailAttachment();
        emailAttachment.setEmail(email);
        emailAttachment.setName(emailAttachmentData.name());
        emailAttachment.setContentType(emailAttachmentData.contentType());
        emailAttachment.setData(emailAttachmentData.data());
        email.getAttachments().add(emailAttachment);
      });

    emailRepository.save(email);
    emailAttachmentRepository.saveAll(email.getAttachments());

    return emailRepository.saveAndFlush(email).getId();
  }

  @Transactional(readOnly = true)
  public String getEmailBody(final long emailId) {
    return emailRepository
      .findById(emailId)
      .map(Email::getBody)
      .orElseThrow(() -> new NotFoundException("Email not found"));
  }

  @Transactional(readOnly = true)
  public List<EmailListProjection> listNewestEmails(final int limit) {
    return emailRepository.findAllByOrderByIdDesc(PageRequest.of(0, limit));
  }

  @Transactional
  public void sendEmail(final long emailId) {
    LOG.debug("Trying to send email id: {}", emailId);
    emailRepository.findById(emailId).ifPresent(this::send);
  }

  private void send(final Email email) {
    try {
      final EmailData emailData = EmailData.createFromEmail(email);
      final String extId = emailSender.sendEmail(emailData);
      email.setSentAt(LocalDateTime.now());
      email.setExtId(extId);
    } catch (final Exception e) {
      LOG.error("Exception when sending email id: " + email.getId(), e);
      email.setError(e.getMessage());
    }
  }
}
