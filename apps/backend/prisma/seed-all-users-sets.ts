import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

const SETS_DATA = [
  {
    title: "Bộ từ vựng cốt lõi tiếng Anh",
    description: "Danh sách 10 từ vựng cốt lõi nâng cao và thông dụng trong học thuật.",
    flashcards: [
      { front: "Accomplish", back: "Hoàn thành, đạt được", hint: "Động từ" },
      { front: "Resilient", back: "Kiên cường, mau phục hồi", hint: "Tính từ" },
      { front: "Eloquent", back: "Hùng biện, lưu loát", hint: "Tính từ" },
      { front: "Benevolent", back: "Nhân từ, rộng lượng", hint: "Tính từ" },
      { front: "Candid", back: "Thật thà, ngay thẳng", hint: "Tính từ" },
      { front: "Diligent", back: "Siêng năng, cần cù", hint: "Tính từ" },
      { front: "Frugal", back: "Tiết kiệm, thanh đạm", hint: "Tính từ" },
      { front: "Gregarious", back: "Thích giao du, hòa đồng", hint: "Tính từ" },
      { front: "Humble", back: "Khiêm tốn, nhún nhường", hint: "Tính từ" },
      { front: "Impartial", back: "Công bằng, không thiên vị", hint: "Tính từ" },
    ]
  },
  {
    title: "Từ vựng Tiếng Anh Công sở",
    description: "Các thuật ngữ chuyên dụng trong môi trường văn phòng, đàm phán và chiến lược.",
    flashcards: [
      { front: "Collaborate", back: "Hợp tác, cộng tác cùng làm việc", hint: "Động từ" },
      { front: "Negotiate", back: "Đàm phán, thương lượng điều khoản", hint: "Động từ" },
      { front: "Implement", back: "Thực hiện, thi hành kế hoạch", hint: "Động từ" },
      { front: "Prioritize", back: "Ưu tiên đặt lên hàng đầu", hint: "Động từ" },
      { front: "Objective", back: "Mục tiêu hướng tới", hint: "Danh từ" },
      { front: "Strategy", back: "Chiến lược, kế hoạch hành động dài hạn", hint: "Danh từ" },
    ]
  },
  {
    title: "Tiếng Anh Du lịch & Dịch vụ",
    description: "Từ vựng thông dụng nhất khi đi máy bay, đặt phòng khách sạn và khám phá thế giới.",
    flashcards: [
      { front: "Itinerary", back: "Lịch trình chi tiết của chuyến đi", hint: "Danh từ" },
      { front: "Destination", back: "Điểm đến, nơi kết thúc hành trình", hint: "Danh từ" },
      { front: "Accommodation", back: "Chỗ ăn ở, lưu trú (khách sạn, nhà nghỉ)", hint: "Danh từ" },
      { front: "Departure", back: "Sự khởi hành, giờ xuất phát", hint: "Danh từ" },
      { front: "Souvenir", back: "Quà lưu niệm mua khi đi chơi", hint: "Danh từ" },
      { front: "Sightseeing", back: "Hoạt động tham quan, ngắm cảnh đẹp", hint: "Danh từ" },
    ]
  },
  {
    title: "Tiếng Anh Công nghệ & Kỷ nguyên số",
    description: "Các thuật ngữ công nghệ thông tin phổ biến và xu hướng trí tuệ nhân tạo.",
    flashcards: [
      { front: "Algorithm", back: "Thuật toán, quy trình giải quyết bài toán", hint: "Danh từ" },
      { front: "Database", back: "Cơ sở dữ liệu lưu trữ thông tin", hint: "Danh từ" },
      { front: "Cybersecurity", back: "An ninh mạng, bảo mật thông tin", hint: "Danh từ" },
      { front: "Innovation", back: "Sự đổi mới, sáng kiến cải tiến công nghệ", hint: "Danh từ" },
      { front: "Integration", back: "Sự tích hợp các hệ thống với nhau", hint: "Danh từ" },
      { front: "Automation", back: "Sự tự động hóa các quy trình công việc", hint: "Danh từ" },
    ]
  },
  {
    title: "Thành ngữ Tiếng Anh thông dụng",
    description: "Những câu nói tự nhiên và sinh động người bản xứ hay dùng hàng ngày.",
    flashcards: [
      { front: "Break a leg", back: "Chúc ai đó may mắn (thường dùng trong biểu diễn)", hint: "Thành ngữ" },
      { front: "Call it a day", back: "Quyết định dừng lại, kết thúc công việc trong ngày", hint: "Thành ngữ" },
      { front: "Under the weather", back: "Cảm thấy hơi mệt mệt, không được khỏe", hint: "Thành ngữ" },
      { front: "Once in a blue moon", back: "Rất hiếm khi, cực kỳ ít khi xảy ra", hint: "Thành ngữ" },
      { front: "Spill the beans", back: "Vô tình tiết lộ bí mật hoặc thông tin kín", hint: "Thành ngữ" },
      { front: "Piece of cake", back: "Rất dễ dàng, dễ như ăn kẹo", hint: "Thành ngữ" },
    ]
  }
];

async function main() {
  console.log("Seeding flashcard sets for ALL users...");

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in the database.`);

  for (const user of users) {
    console.log(`Processing sets for user: ${user.email} (ID: ${user.id})...`);

    for (const setData of SETS_DATA) {
      // Check if user already has a set with the same title
      const existingSet = await prisma.flashcardSet.findFirst({
        where: {
          userId: user.id,
          title: setData.title
        }
      });

      if (!existingSet) {
        // Create the set for this user
        const newSet = await prisma.flashcardSet.create({
          data: {
            title: setData.title,
            description: setData.description,
            userId: user.id,
            flashcards: {
              create: setData.flashcards.map(f => ({
                front: f.front,
                back: f.back,
                hint: f.hint
              }))
            }
          },
          include: {
            flashcards: true
          }
        });

        console.log(`  Created set: "${setData.title}" (${newSet.flashcards.length} cards) for user ${user.email}`);

        // If it's the core English set, also create the quiz for this user if they don't have it
        if (setData.title === "Bộ từ vựng cốt lõi tiếng Anh") {
          const existingQuiz = await prisma.quiz.findFirst({
            where: {
              userId: user.id,
              title: "Bài kiểm tra từ vựng cốt lõi"
            }
          });

          if (!existingQuiz) {
            await prisma.quiz.create({
              data: {
                title: "Bài kiểm tra từ vựng cốt lõi",
                flashcardSetId: newSet.id,
                userId: user.id,
                questionCount: 10,
                shuffle: true,
                timeLimitSecs: 30,
                questions: {
                  create: [
                    {
                      type: QuestionType.MULTIPLE_CHOICE,
                      prompt: "Từ <strong>Accomplish</strong> có nghĩa là gì?",
                      options: ["Hoàn thành, đạt được", "Trì hoãn, hủy bỏ", "Nhân từ, rộng lượng", "Khiêm tốn, nhún nhường"],
                      answer: "Hoàn thành, đạt được",
                      explanation: "Accomplish nghĩa là hoàn thành xuất sắc một công việc hoặc đạt được mục tiêu.",
                      order: 0
                    },
                    {
                      type: QuestionType.MULTIPLE_CHOICE,
                      prompt: "Từ nào sau đây có nghĩa là <strong>Kiên cường, mau phục hồi</strong>?",
                      options: ["Resilient", "Eloquent", "Frugal", "Humble"],
                      answer: "Resilient",
                      explanation: "Resilient chỉ khả năng phục hồi nhanh chóng sau những khó khăn.",
                      order: 1
                    },
                    {
                      type: QuestionType.MULTIPLE_CHOICE,
                      prompt: "Nghĩa của từ <strong>Eloquent</strong> là gì?",
                      options: ["Hùng biện, lưu loát", "Thật thà, thẳng thắn", "Tiết kiệm, thanh đạm", "Công bằng, không thiên vị"],
                      answer: "Hùng biện, lưu loát",
                      explanation: "Eloquent diễn tả cách nói năng lưu loát, hùng hồn và thuyết phục.",
                      order: 2
                    },
                    {
                      type: QuestionType.MULTIPLE_CHOICE,
                      prompt: "Từ <strong>Benevolent</strong> có nghĩa là gì?",
                      options: ["Nhân từ, rộng lượng", "Kiên cường, chịu đựng tốt", "Thích giao du, hòa đồng", "Siêng năng, cần cù"],
                      answer: "Nhân từ, rộng lượng",
                      explanation: "Benevolent chỉ tính cách tử tế, nhân từ, muốn làm điều tốt cho người khác.",
                      order: 3
                    },
                    {
                      type: QuestionType.MULTIPLE_CHOICE,
                      prompt: "Chọn từ tiếng Anh cho nghĩa: <strong>Thật thà, ngay thẳng</strong>.",
                      options: ["Candid", "Gregarious", "Impartial", "Diligent"],
                      answer: "Candid",
                      explanation: "Candid nghĩa là thật thà, thẳng thắn, bộc trực.",
                      order: 4
                    },
                    {
                      type: QuestionType.TRUE_FALSE,
                      prompt: "Từ <strong>Diligent</strong> có nghĩa là siêng năng, cần cù. Đúng hay Sai?",
                      answer: "true",
                      explanation: "Đúng. Diligent chỉ người làm việc chăm chỉ, siêng năng và cẩn thận.",
                      order: 5
                    },
                    {
                      type: QuestionType.TRUE_FALSE,
                      prompt: "Từ <strong>Frugal</strong> có nghĩa là hoang phí, tiêu xài không suy nghĩ. Đúng hay Sai?",
                      answer: "false",
                      explanation: "Sai. Frugal nghĩa là tiết kiệm, thanh đạm, chi tiêu chừng mực.",
                      order: 6
                    },
                    {
                      type: QuestionType.TRUE_FALSE,
                      prompt: "Từ <strong>Gregarious</strong> miêu tả người sống thu mình và không thích giao thiệp xã hội. Đúng hay Sai?",
                      answer: "false",
                      explanation: "Sai. Gregarious nghĩa là hòa đồng, thích giao du, thích ở đám đông.",
                      order: 7
                    },
                    {
                      type: QuestionType.FILL_IN_BLANK,
                      prompt: "Điền từ thích hợp (từ bắt đầu bằng chữ 'H'): <strong>___________</strong> có nghĩa là khiêm tốn, nhún nhường.",
                      answer: "humble",
                      explanation: "Humble nghĩa là khiêm tốn, nhún nhường, không tự cao tự đại.",
                      order: 8
                    },
                    {
                      type: QuestionType.FILL_IN_BLANK,
                      prompt: "Điền từ thích hợp (từ bắt đầu bằng chữ 'I'): <strong>___________</strong> có nghĩa là công bằng, không thiên vị.",
                      answer: "impartial",
                      explanation: "Impartial nghĩa là công bằng, vô tư, không thiên vị bên nào.",
                      order: 9
                    }
                  ]
                }
              }
            });
            console.log(`    Created quiz "Bài kiểm tra từ vựng cốt lõi" for user ${user.email}`);
          }
        }
      } else {
        console.log(`  Set: "${setData.title}" already exists for user ${user.email}`);
      }
    }
  }

  console.log("Seeding flashcard sets for ALL users complete!");
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
