import { Title, Text, Stack, Card, Grid, Badge, Group, Button } from '@mantine/core';
import { IconDatabase, IconApi, IconCode, IconBrandReact } from '@tabler/icons-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';

const features = [
  {
    title: 'Next.js 15',
    description: 'App Routerを使用した最新のNext.jsアプリケーション',
    icon: IconCode,
    color: 'blue',
  },
  {
    title: 'Mantine v8',
    description: 'モダンなReact UIライブラリ',
    icon: IconBrandReact,
    color: 'green',
  },
  {
    title: 'Prisma ORM',
    description: 'MariaDBとの連携を実現する型安全なORM',
    icon: IconDatabase,
    color: 'violet',
  },
  {
    title: 'API Routes',
    description: '取得系処理と更新系処理の分離設計',
    icon: IconApi,
    color: 'orange',
  },
];

export default function Home() {
  return (
    <MainLayout>
      <Stack>
        <div>
          <Title order={1} mb="md">
            Next.js Template
          </Title>
          <Text size="lg" c="dimmed">
            Next.js 15 + Mantine v8 + Prisma を使用したモダンなWebアプリケーションテンプレート
          </Text>
        </div>

        <Grid>
          {features.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
                <Group mb="xs">
                  <feature.icon size="1.5rem" />
                  <Title order={4}>{feature.title}</Title>
                  <Badge color={feature.color} size="sm">
                    実装済み
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Title order={3}>クイックスタート</Title>
            <Group>
              <Button component={Link} href="/users" variant="filled">
                ユーザー管理
              </Button>
              <Button component={Link} href="/products" variant="filled">
                商品管理
              </Button>
              <Button component={Link} href="/api/health" variant="outline">
                ヘルスチェック
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </MainLayout>
  );
}
