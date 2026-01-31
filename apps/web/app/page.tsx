"use client";

import { Button, Card, Flex, Layout, Typography } from "antd";
import styles from "./page.module.css";

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <Layout className={styles.page}>
      <Layout.Content className={styles.content}>
        <Card className={styles.hero} variant="borderless">
          <Flex vertical gap={16}>
            <Text className={styles.kicker}>CRM / Light ERP</Text>
            <Title level={2} className={styles.title}>
              Welcome to the CRM workspace
            </Title>
            <Paragraph className={styles.subtitle}>
              Start by creating your first lead or exploring today&apos;s pipeline.
            </Paragraph>
            <Flex gap={12} wrap>
              <Button type="primary">New Lead</Button>
              <Button>View Pipeline</Button>
            </Flex>
          </Flex>
        </Card>
      </Layout.Content>
    </Layout>
  );
}
