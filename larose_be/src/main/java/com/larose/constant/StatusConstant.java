package com.larose.constant;

public class StatusConstant {
    public static class BookingStatus {
        public static final String PENDING = "pending";
        public static final String CONFIRMED = "confirmed";
        public static final String CHECK_IN = "check_in";
        public static final String CHECK_OUT = "check_out";
        public static final String CANCELLED = "cancelled";
        public static final String NO_SHOW = "no_show";
    }

    public static class RoomStatus {
        public static final String AVAILABLE = "available";
        public static final String MAINTENANCE = "maintenance";
        public static final String OFFLINE = "offline";
    }

    public static class TransactionStatus {
        public static final String INITIATED = "initiated";
        public static final String SUCCESS = "success";
        public static final String FAILED = "failed";
        public static final String REFUNDED = "refunded";
    }
    public static class TransactionType {
        public static final String PAYMENT = "payment";
        public static final String REFUND = "refund";
        public static final String PAYOUT = "payout";
    }
}
