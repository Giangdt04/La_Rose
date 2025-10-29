import HttpService from "./http.service";

class VnpayService {
  constructor() {
    this.httpService = new HttpService("http://localhost:8080");
    this.basePath = "/api/vnpay";
  }

  async submitOrder(orderData) {
    try {
      const params = new URLSearchParams();
      params.append("amount", orderData.amount.toString());
      params.append("orderInfo", orderData.orderInfo);
      params.append("roomId", orderData.roomId.toString());

      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${this.httpService.baseURL}${this.basePath}/submit-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        if (text.startsWith("http")) {
          result = { paymentUrl: text };
        } else {
          try {
            result = JSON.parse(text);
          } catch {
            result = { paymentUrl: text };
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error submitting VNPay order:", error);
      throw error;
    }
  }

  async handleVnpayReturn(queryParams) {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      return await this.httpService.get(
        `${this.basePath}/vnpay_return?${queryString}`
      );
    } catch (error) {
      console.error("Error handling VNPay return:", error);
      throw error;
    }
  }
}

const vnpayService = new VnpayService();
export default vnpayService;
