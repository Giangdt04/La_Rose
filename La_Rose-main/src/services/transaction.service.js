import HttpService from "./http.service";

class TransactionService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/transaction";
  }

  async createTransaction(transactionData) {
    try {
      return await this.httpService.post(this.basePath, transactionData);
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;
