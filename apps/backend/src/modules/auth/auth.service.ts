import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existedUser) {
      throw new BadRequestException('Email already exists');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new BadRequestException('USER role not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    // Create default subscription for new user
    await this.prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
      },
    });

    // Populate default flashcard sets & quizzes
    await this.createDefaultSetsAndQuizzes(user.id);

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Account is blocked');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
      },
    });

    return {
      message: 'Logout success',
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role.name },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    return { accessToken };
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash,
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  private async createDefaultSetsAndQuizzes(userId: number) {
    const setsData = [
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

    for (const setData of setsData) {
      const newSet = await this.prisma.flashcardSet.create({
        data: {
          title: setData.title,
          description: setData.description,
          userId,
          flashcards: {
            create: setData.flashcards.map(f => ({
              front: f.front,
              back: f.back,
              hint: f.hint
            }))
          }
        }
      });

      if (setData.title === "Bộ từ vựng cốt lõi tiếng Anh") {
        await this.prisma.quiz.create({
          data: {
            title: "Bài kiểm tra từ vựng cốt lõi",
            flashcardSetId: newSet.id,
            userId,
            questionCount: 10,
            shuffle: true,
            timeLimitSecs: 30,
            questions: {
              create: [
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt: "Từ <strong>Accomplish</strong> có nghĩa là gì?",
                  options: ["Hoàn thành, đạt được", "Trì hoãn, hủy bỏ", "Nhân từ, rộng lượng", "Khiêm tốn, nhún nhường"],
                  answer: "Hoàn thành, đạt được",
                  explanation: "Accomplish nghĩa là hoàn thành xuất sắc một công việc hoặc đạt được mục tiêu.",
                  order: 0
                },
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt: "Từ nào sau đây có nghĩa là <strong>Kiên cường, mau phục hồi</strong>?",
                  options: ["Resilient", "Eloquent", "Frugal", "Humble"],
                  answer: "Resilient",
                  explanation: "Resilient chỉ khả năng phục hồi nhanh chóng sau những khó khăn.",
                  order: 1
                },
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt: "Nghĩa của từ <strong>Eloquent</strong> là gì?",
                  options: ["Hùng biện, lưu loát", "Thật thà, thẳng thắn", "Tiết kiệm, thanh đạm", "Công bằng, không thiên vị"],
                  answer: "Hùng biện, lưu loát",
                  explanation: "Eloquent diễn tả cách nói năng lưu loát, hùng hồn và thuyết phục.",
                  order: 2
                },
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt: "Từ <strong>Benevolent</strong> có nghĩa là gì?",
                  options: ["Nhân từ, rộng lượng", "Kiên cường, chịu đựng tốt", "Thích giao du, hòa đồng", "Siêng năng, cần cù"],
                  answer: "Nhân từ, rộng lượng",
                  explanation: "Benevolent chỉ tính cách tử tế, nhân từ, muốn làm điều tốt cho người khác.",
                  order: 3
                },
                {
                  type: 'MULTIPLE_CHOICE',
                  prompt: "Chọn từ tiếng Anh cho nghĩa: <strong>Thật thà, ngay thẳng</strong>.",
                  options: ["Candid", "Gregarious", "Impartial", "Diligent"],
                  answer: "Candid",
                  explanation: "Candid nghĩa là thật thà, thẳng thắn, bộc trực.",
                  order: 4
                },
                {
                  type: 'TRUE_FALSE',
                  prompt: "Từ <strong>Diligent</strong> có nghĩa là siêng năng, cần cù. Đúng hay Sai?",
                  answer: "true",
                  explanation: "Đúng. Diligent chỉ người làm việc chăm chỉ, siêng năng và cẩn thận.",
                  order: 5
                },
                {
                  type: 'TRUE_FALSE',
                  prompt: "Từ <strong>Frugal</strong> có nghĩa là hoang phí, tiêu xài không suy nghĩ. Đúng hay Sai?",
                  answer: "false",
                  explanation: "Sai. Frugal nghĩa là tiết kiệm, thanh đạm, chi tiêu chừng mực.",
                  order: 6
                },
                {
                  type: 'TRUE_FALSE',
                  prompt: "Từ <strong>Gregarious</strong> miêu tả người sống thu mình và không thích giao thiệp xã hội. Đúng hay Sai?",
                  answer: "false",
                  explanation: "Sai. Gregarious nghĩa là hòa đồng, thích giao du, thích ở đám đông.",
                  order: 7
                },
                {
                  type: 'FILL_IN_BLANK',
                  prompt: "Điền từ thích hợp (từ bắt đầu bằng chữ 'H'): <strong>___________</strong> có nghĩa là khiêm tốn, nhún nhường.",
                  answer: "humble",
                  explanation: "Humble nghĩa là khiêm tốn, nhún nhường, không tự cao tự đại.",
                  order: 8
                },
                {
                  type: 'FILL_IN_BLANK',
                  prompt: "Điền từ thích hợp (từ bắt đầu bằng chữ 'I'): <strong>___________</strong> có nghĩa là công bằng, không thiên vị.",
                  answer: "impartial",
                  explanation: "Impartial nghĩa là công bằng, vô tư, không thiên vị bên nào.",
                  order: 9
                }
              ]
            }
          }
        });
      }
    }
  }
}