import HttpService from "./http.service";

class EmailService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/email";
  }

  async sendTestEmail(emailData) {
    try {
      return await this.httpService.post(
        `${this.basePath}/send-test`,
        emailData
      );
    } catch (error) {
      console.error("Error sending test email:", error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
