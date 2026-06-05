import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vocabularies = [
  // IELTS
  {
    word: "Meticulous",
    meaning: "Tỉ mỉ, kỹ càng, quá cẩn thận về chi tiết",
    ipa: "/məˈtɪkjələs/",
    partOfSpeech: "adjective",
    example: "She was meticulous about keeping her records up to date.",
    level: "C1",
    topic: "IELTS",
  },
  {
    word: "Ambiguate",
    meaning: "Làm cho mơ hồ, không rõ ràng",
    ipa: "/æmˈbɪɡjueɪt/",
    partOfSpeech: "verb",
    example: "The author decided to ambiguate the ending of the novel to make readers think.",
    level: "C2",
    topic: "IELTS",
  },
  {
    word: "Pragmatic",
    meaning: "Thực tế, thực dụng",
    ipa: "/præɡˈmætɪk/",
    partOfSpeech: "adjective",
    example: "We need a pragmatic approach to solving this economic problem.",
    level: "B2",
    topic: "IELTS",
  },
  {
    word: "Alleviate",
    meaning: "Làm giảm bớt, làm nhẹ bớt (nỗi đau, sự khó khăn)",
    ipa: "/əˈliːvieɪt/",
    partOfSpeech: "verb",
    example: "A cold compress can alleviate the pain of a minor burn.",
    level: "C1",
    topic: "IELTS",
  },

  // TOEIC
  {
    word: "Negotiate",
    meaning: "Đàm phán, thương lượng",
    ipa: "/nɪˈɡoʊʃieɪt/",
    partOfSpeech: "verb",
    example: "The customer service representative tried to negotiate a compromise.",
    level: "B1",
    topic: "TOEIC",
  },
  {
    word: "Collaborate",
    meaning: "Hợp tác, cộng tác",
    ipa: "/kəˈlæbəreɪt/",
    partOfSpeech: "verb",
    example: "Researchers are collaborating to develop a new vaccine.",
    level: "B2",
    topic: "TOEIC",
  },
  {
    word: "Terminate",
    meaning: "Chấm dứt, hủy bỏ (hợp đồng, thỏa thuận)",
    ipa: "/ˈtɜːrmɪneɪt/",
    partOfSpeech: "verb",
    example: "The company decided to terminate the contract with the supplier.",
    level: "B2",
    topic: "TOEIC",
  },
  {
    word: "Authorize",
    meaning: "Ủy quyền, cho phép",
    ipa: "/ˈɔːθəraɪz/",
    partOfSpeech: "verb",
    example: "Only the manager can authorize refunds over one hundred dollars.",
    level: "B1",
    topic: "TOEIC",
  },

  // TOEFL
  {
    word: "Hypothesis",
    meaning: "Giả thuyết",
    ipa: "/haɪˈpɑːθəsɪs/",
    partOfSpeech: "noun",
    example: "The scientist formulated a new hypothesis based on recent data.",
    level: "B2",
    topic: "TOEFL",
  },
  {
    word: "Phenomenon",
    meaning: "Hiện tượng",
    ipa: "/fəˈnɑːmɪnən/",
    partOfSpeech: "noun",
    example: "Glaciation is a natural phenomenon that shapes geography.",
    level: "C1",
    topic: "TOEFL",
  },
  {
    word: "Corroborate",
    meaning: "Xác minh, chứng thực (bằng chứng, lời khai)",
    ipa: "/kəˈrɑːbəreɪt/",
    partOfSpeech: "verb",
    example: "Independent geological studies corroborate the discovery.",
    level: "C2",
    topic: "TOEFL",
  },
  {
    word: "Empirical",
    meaning: "Thực nghiệm, dựa trên quan sát thực tế",
    ipa: "/ɪmˈpɪrɪkl/",
    partOfSpeech: "adjective",
    example: "Empirical evidence is required to prove a scientific claim.",
    level: "C1",
    topic: "TOEFL",
  }
];

async function main() {
  console.log("Seeding sample vocabularies...");
  for (const item of vocabularies) {
    await prisma.vocabulary.create({
      data: item
    });
  }
  console.log(`Successfully seeded ${vocabularies.length} vocabulary words!`);
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
