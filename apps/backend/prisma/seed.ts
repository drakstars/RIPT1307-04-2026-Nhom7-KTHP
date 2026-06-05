import * as bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      fullName: 'System Admin',
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, plan: 'FREE' },
    });
  }

  // Seeding sample courses
  console.log("Clearing and re-seeding Vietnamese sample courses...");
  await prisma.course.deleteMany();
  
  // 1. Beginner Course
  await prisma.course.create({
    data: {
      title: "Làm chủ Phát âm Tiếng Anh",
      description: "Làm chủ Bảng phiên âm quốc tế (IPA), trọng âm từ và ngữ điệu tự nhiên để nói tiếng Anh rõ ràng, tự tin.",
      level: "BEGINNER",
      emoji: "🗣️",
      published: true,
      order: 1,
      lessons: {
        create: [
          {
            title: "Giới thiệu về Bảng phiên âm IPA",
            type: "READING",
            content: "# Giới thiệu về Bảng phiên âm Quốc tế (IPA)\n\nBảng phiên âm Quốc tế (International Phonetic Alphabet - IPA) là hệ thống ký hiệu ngữ âm dựa trên các ký tự Latinh, được tạo ra nhằm chuẩn hóa cách phát âm các âm tiết trong mọi ngôn ngữ.\n\n## Tại sao phải học IPA?\n\n1. **Phát âm chuẩn mọi từ vựng**: Không giống tiếng Việt, cách viết từ tiếng Anh không phản ánh hoàn toàn cách phát âm của nó. Ví dụ, đuôi 'ou' trong *cough*, *tough*, *through* và *though* phát âm hoàn toàn khác nhau. Học IPA sẽ giúp bạn tra từ điển và phát âm chuẩn xác bất kỳ từ nào.\n2. **Cải thiện khả năng Nghe**: Khi bạn hiểu và phát âm đúng các âm vật lý trong tiếng Anh, bạn sẽ nghe thấy chúng rõ ràng hơn rất nhiều trong giao tiếp hàng ngày.\n\n## Video hướng dẫn trực quan\nHãy xem video dưới đây để luyện nghe phát âm chuẩn các âm trong bảng IPA nhé:\n\n@[youtube](wKEI9n_Xs5Q)",
            durationMins: 10,
            order: 1,
          },
          {
            title: "Phân biệt Nguyên âm và Phụ âm",
            type: "READING",
            content: "# Phân biệt Nguyên âm và Phụ âm\n\nTiếng Anh có 26 chữ cái viết, nhưng có tới **44 âm phát âm riêng biệt**! Các âm này được chia thành 2 nhóm chính: Nguyên âm và Phụ âm.\n\n## Nguyên âm (20 âm)\n- **Nguyên âm đơn**: ví dụ, âm /i:/ trong *see*, /ɪ/ trong *sit*, /æ/ trong *cat*.\n- **Nguyên âm đôi**: ví dụ, âm /aɪ/ trong *my*, /eɪ/ trong *say*, /oʊ/ trong *go*.\n\n## Phụ âm (24 âm)\n- **Phụ âm hữu thanh**: Dây thanh quản rung khi phát âm, ví dụ: /b/, /d/, /g/, /v/.\n- **Phụ âm vô thanh**: Dây thanh quản không rung, ví dụ: /p/, /t/, /k/, /f/.\n\n## Video hướng dẫn trực quan\nHọc cách phân biệt nguyên âm và phụ âm chi tiết qua video dưới đây:\n\n@[youtube](DyYFwoITfXY)",
            durationMins: 12,
            order: 2,
          },
          {
            title: "Quy tắc Đánh Trọng âm Từ",
            type: "READING",
            content: "# Trọng âm Từ trong Tiếng Anh\n\nTrọng âm từ là chìa khóa vàng để nghe và nói tiếng Anh tự nhiên. Tiếng Anh là **ngôn ngữ nhấn trọng âm (stress-timed language)**, nghĩa là một số âm tiết sẽ được phát âm to hơn, dài hơn và cao hơn các âm tiết còn lại.\n\n## Quy tắc cốt lõi về Trọng âm\n\n1. **Mỗi từ chỉ có MỘT trọng âm chính**: Một từ không bao giờ có hai trọng âm chính.\n2. **Chỉ nhấn trọng âm vào NGUYÊN ÂM**: Chúng ta không bao giờ nhấn trọng âm vào phụ âm.\n3. **Danh từ 2 âm tiết**: Thường nhấn trọng âm vào âm tiết thứ nhất (ví dụ: **PRE-sent**, **OB-ject**, **TA-ble**).\n4. **Động từ 2 âm tiết**: Thường nhấn trọng âm vào âm tiết thứ hai (ví dụ: to pre-**SENT**, to ob-**JECT**).\n\n## Video thực hành thực tế\nXem video dưới đây để nắm vững các mẹo đánh trọng âm từ tiếng Anh dễ nhớ nhất:\n\n@[youtube](Um_Maxdf0mI)",
            durationMins: 15,
            order: 3,
          }
        ]
      }
    }
  });

  // 2. Intermediate Course
  await prisma.course.create({
    data: {
      title: "Tiếng Anh Giao tiếp Hàng ngày",
      description: "Thực hành các cụm từ, thành ngữ thông dụng và cấu trúc đàm thoại tự nhiên trong giao tiếp xã hội hàng ngày.",
      level: "INTERMEDIATE",
      emoji: "💬",
      published: true,
      order: 2,
      lessons: {
        create: [
          {
            title: "Chào hỏi & Tán gẫu tự nhiên",
            type: "READING",
            content: "# Chào hỏi & Tán gẫu tự nhiên (Small Talk)\n\nTán gẫu (Small Talk) là những đoạn hội thoại ngắn, không trịnh trọng, giúp xây dựng mối quan hệ ban đầu cực kỳ tốt trước khi đi vào chủ đề chính.\n\n## Cách chào hỏi tự nhiên\n- *Thay vì nói:* \"Hello, how are you?\" (Nghe rất sách vở)\n- *Hãy dùng:* \"Hey! How's it going?\" hoặc \"Good to see you! What have you been up to?\"\n\n## Gợi ý chủ đề tán gẫu dễ dàng\n1. Nói về thời tiết: \"Nice day, isn't it?\"\n2. Hỏi về cuối tuần: \"Do you have any plans for the weekend?\"\n3. Hỏi về sở thích/phim ảnh: \"Have you seen any good movies lately?\"\n\n## Video hội thoại thực tế\nXem video dưới đây để học cách người bản xứ chào hỏi và bắt đầu câu chuyện tự nhiên:\n\n@[youtube](Ew9N4rnfrBA)",
            durationMins: 10,
            order: 1,
          },
          {
            title: "Bày tỏ Ý kiến & Đồng ý/Từ chối",
            type: "READING",
            content: "# Bày tỏ Ý kiến & Đồng ý/Từ chối\n\nBiết cách chia sẻ suy nghĩ cá nhân một cách lịch sự và hỏi ý kiến của người khác giúp cuộc đối thoại trở nên cởi mở và hấp dẫn hơn.\n\n## Cụm từ bày tỏ ý kiến lịch sự\n- \"In my opinion...\" (Theo ý kiến của tôi...)\n- \"If you ask me...\" (Nếu bạn hỏi tôi...)\n- \"It seems to me that...\" (Đối với tôi dường như...)\n\n## Đồng ý và Từ chối lịch sự\n- **Đồng ý**: \"I couldn't agree more!\" (Tôi hoàn toàn đồng ý!) hoặc \"That's exactly how I feel.\"\n- **Từ chối**: \"I see your point, but...\" (Tôi hiểu ý bạn, nhưng...) hoặc \"I'm not so sure about that.\" (Tôi không chắc chắn lắm về điều đó).\n\n## Video ví dụ trực quan\nHọc cách đồng ý hoặc từ chối một cách lịch sự, tự nhiên qua video sau:\n\n@[youtube](CMYiLq-UgD4)",
            durationMins: 10,
            order: 2,
          }
        ]
      }
    }
  });

  // 3. Advanced Course
  await prisma.course.create({
    data: {
      title: "Tiếng Anh Giao tiếp Công sở",
      description: "Nâng tầm tiếng Anh công sở chuyên nghiệp: làm chủ các cuộc họp, thuyết trình ấn tượng và viết email thương mại thuyết phục.",
      level: "ADVANCED",
      emoji: "💼",
      published: true,
      order: 3,
      lessons: {
        create: [
          {
            title: "Kỹ năng hội họp tích cực",
            type: "READING",
            content: "# Kỹ năng họp hành & Thảo luận tích cực\n\nĐể làm việc tự tin trong môi trường đa quốc gia, bạn cần biết cách phát biểu ý kiến, ngắt lời lịch sự và tóm tắt công việc sau buổi họp.\n\n## Phrasal Verbs thông dụng trong cuộc họp\n- **Bring up**: Đưa ra một chủ đề thảo luận (ví dụ: \"I'd like to bring up the budget issue.\")\n- **Wrap up**: Kết thúc, tóm tắt cuộc họp (ví dụ: \"Let's wrap up this meeting and assign tasks.\")\n- **Call off**: Hủy lịch họp (ví dụ: \"We had to call off the meeting due to conflicts.\")\n\n## Cách ngắt lời lịch sự\n- \"Could I just jump in here for a moment?\" (Tôi có thể xin phép xen vào một chút được không?)\n- \"Excuse me, if I could just add something quickly...\" (Xin lỗi, nếu tôi có thể bổ sung nhanh một ý...)\n\n## Video bài học thực tế\nHọc cách làm chủ phòng họp và phát biểu tự tin hơn bằng tiếng Anh qua video dưới đây:\n\n@[youtube](zTE8YypAEDg)",
            durationMins: 15,
            order: 1,
          },
          {
            title: "Viết Email Công sở chuyên nghiệp",
            type: "READING",
            content: "# Viết Email Công sở chuyên nghiệp & Thuyết phục\n\nViết email rõ ràng, chuyên nghiệp và đúng cấu trúc là kỹ năng làm việc cốt lõi của mọi nhân viên văn phòng.\n\n## Cấu trúc chuẩn của một Email công sở\n1. **Tiêu đề email rõ ràng (Subject Line)**: Cụ thể chủ đề (ví dụ: *Action Required: Feedback on Q3 Marketing Plan*)\n2. **Lời chào mở đầu chuyên nghiệp**: \"Dear Mr./Ms. [Tên]\" hoặc \"Hi [Tên]\"\n3. **Nêu rõ mục đích email**: Đi thẳng vào vấn đề (ví dụ: \"I am writing to update you on...\")\n4. **Nêu rõ hành động cần thiết (Call to Action)**: Chỉ rõ bạn cần họ làm gì (ví dụ: \"Could you please review and sign by tomorrow at 5 PM?\")\n5. **Lời kết chuyên nghiệp**: \"Best regards,\" hoặc \"Sincerely,\"",
            durationMins: 12,
            order: 2,
          }
        ]
      }
    }
  });
  
  console.log("Successfully seeded Vietnamese sample courses!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });