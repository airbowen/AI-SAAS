import { PrismaClient } from "@prisma/client";

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  emailFrequency: 'daily' | 'weekly' | 'never';
}

export class PreferencesService {
  constructor(private prisma: PrismaClient) {}

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });
    return user?.preferences || this.getDefaultPreferences();
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          upsert: {
            create: preferences,
            update: preferences
          }
        }
      }
    });
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'zh-CN',
      theme: 'light',
      notifications: true,
      emailFrequency: 'weekly'
    };
  }
}