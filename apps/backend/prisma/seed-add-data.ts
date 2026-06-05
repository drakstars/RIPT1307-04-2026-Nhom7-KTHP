import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 10 flashcards and 1 quiz...");

  // 1. Find the default admin user
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' }
  });

  if (!adminUser) {
    console.error("Admin user (admin@gmail.com) not found! Please ensure database is seeded first.");
    return;
  }

  // 2. Create the FlashcardSet
  const flashcardSet = await prisma.flashcardSet.create({
    data: {
      title: "Bộ từ vựng cốt lõi tiếng Anh",
      description: "Danh sách 10 từ vựng cốt lõi nâng cao và thông dụng trong học thuật.",
      userId: adminUser.id,
      flashcards: {
        create: [
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
      }
    },
    include: {
      flashcards: true
    }
  });

  console.log(`Created FlashcardSet: "${flashcardSet.title}" with 10 cards.`);

  // 3. Create the Quiz with 10 Questions corresponding to the cards
  const quiz = await prisma.quiz.create({
    data: {
      title: "Bài kiểm tra từ vựng cốt lõi",
      flashcardSetId: flashcardSet.id,
      userId: adminUser.id,
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

  console.log(`Created Quiz: "${quiz.title}" with 10 questions.`);
  console.log("Seeding complete!");
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
