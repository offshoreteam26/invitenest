/** An error the website is allowed to see (wrong id, bad answers, closed RSVP). */
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Every API answer goes through here, so the format is always the same. */
const json_ = obj => ContentService.createTextOutput(JSON.stringify(obj))
  .setMimeType(ContentService.MimeType.JSON);
