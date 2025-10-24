package com.larose.util;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ImageResizeUtil {

    public static byte[] resize(MultipartFile file, int width, int height) throws IOException {
        try (InputStream is = file.getInputStream(); ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            Thumbnails.of(is)
                    .size(width, height) // ví dụ 1080x1080 max
                    .outputFormat("jpg") // chuyển sang jpg để giảm dung lượng
                    .toOutputStream(os);
            return os.toByteArray();
        }
    }
}

