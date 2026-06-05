import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 4 additional themed flashcard sets...");

  // Find the default admin user
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' }
  });

  if (!adminUser) {
    console.error("Admin user (admin@gmail.com) not found!");
    return;
  }

  // 1. Business English Set
  await prisma.flashcardSet.create({
    data: {
      title: "Từ vựng Tiếng Anh Công sở",
      description: "Các thuật ngữ chuyên dụng trong môi trường văn phòng, đàm phán và chiến lược.",
      userId: adminUser.id,
      flashcards: {
        create: [
          { front: "Collaborate", back: "Hợp tác, cộng tác cùng làm việc", hint: "Động từ" },
          { front: "Negotiate", back: "Đàm phán, thương lượng điều khoản", hint: "Động từ" },
          { front: "Implement", back: "Thực hiện, thi hành kế hoạch", hint: "Động từ" },
          { front: "Prioritize", back: "Ưu tiên đặt lên hàng đầu", hint: "Động từ" },
          { front: "Objective", back: "Mục tiêu hướng tới", hint: "Danh từ" },
          { front: "Strategy", back: "Chiến lược, kế hoạch hành động dài hạn", hint: "Danh từ" },
        ]
      }
    }
  });

  // 2. Travel English Set
  await prisma.flashcardSet.create({
    data: {
      title: "Tiếng Anh Du lịch & Dịch vụ",
      description: "Từ vựng thông dụng nhất khi đi máy bay, đặt phòng khách sạn và khám phá thế giới.",
      userId: adminUser.id,
      flashcards: {
        create: [
          { front: "Itinerary", back: "Lịch trình chi tiết của chuyến đi", hint: "Danh từ" },
          { front: "Destination", back: "Điểm đến, nơi kết thúc hành trình", hint: "Danh từ" },
          { front: "Accommodation", back: "Chỗ ăn ở, lưu trú (khách sạn, nhà nghỉ)", hint: "Danh từ" },
          { front: "Departure", back: "Sự khởi hành, giờ xuất phát", hint: "Danh từ" },
          { front: "Souvenir", back: "Quà lưu niệm mua khi đi chơi", hint: "Danh từ" },
          { front: "Sightseeing", back: "Hoạt động tham quan, ngắm cảnh đẹp", hint: "Danh từ" },
        ]
      }
    }
  });

  // 3. Technology & AI Set
  await prisma.flashcardSet.create({
    data: {
      title: "Tiếng Anh Công nghệ & Kỷ nguyên số",
      description: "Các thuật ngữ công nghệ thông tin phổ biến và xu hướng trí tuệ nhân tạo.",
      userId: adminUser.id,
      flashcards: {
        create: [
          { front: "Algorithm", back: "Thuật toán, quy trình giải quyết bài toán", hint: "Danh từ" },
          { front: "Database", back: "Cơ sở dữ liệu lưu trữ thông tin", hint: "Danh từ" },
          { front: "Cybersecurity", back: "An ninh mạng, bảo mật thông tin", hint: "Danh từ" },
          { front: "Innovation", back: "Sự đổi mới, sáng kiến cải tiến công nghệ", hint: "Danh từ" },
          { front: "Integration", back: "Sự tích hợp các hệ thống với nhau", hint: "Danh từ" },
          { front: "Automation", back: "Sự tự động hóa các quy trình công việc", hint: "Danh từ" },
        ]
      }
    }
  });

  // 4. Idioms Set
  await prisma.flashcardSet.create({
    data: {
      title: "Thành ngữ Tiếng Anh thông dụng",
      description: "Những câu nói tự nhiên và sinh động người bản xứ hay dùng hàng ngày.",
      userId: adminUser.id,
      flashcards: {
        create: [
          { front: "Break a leg", back: "Chúc ai đó may mắn (thường dùng trong biểu diễn)", hint: "Thành ngữ" },
          { front: "Call it a day", back: "Quyết định dừng lại, kết thúc công việc trong ngày", hint: "Thành ngữ" },
          { front: "Under the weather", back: "Cảm thấy hơi mệt mệt, không được khỏe", hint: "Thành ngữ" },
          { front: "Once in a blue moon", back: "Rất hiếm khi, cực kỳ ít khi xảy ra", hint: "Thành ngữ" },
          { front: "Spill the beans", back: "Vô tình tiết lộ bí mật hoặc thông tin kín", hint: "Thành ngữ" },
          { front: "Piece of cake", back: "Rất dễ dàng, dễ như ăn kẹo", hint: "Thành ngữ" },
        ]
      }
    }
  });

  console.log("Successfully seeded 4 additional flashcard sets!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
