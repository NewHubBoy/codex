"use client";

import { useRouter } from "next/navigation";
import { Card, Row, Col, Statistic, List, Tag, Typography, Space, Button } from "antd";
import { RocketOutlined, ShoppingCartOutlined, FileTextOutlined, AlertOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { useAlertSummary } from "@/hooks/useAlerts";
import { useI18n } from "@/i18n/provider";

const { Text } = Typography;

// 模拟数据 - 后续替换为真实 API
const mockStats = {
  leads: { total: 128, growth: 12.5 },
  opportunities: { total: 45, growth: 8.3 },
  quotes: { total: 32, growth: -3.2 },
  tickets: { total: 18, growth: 15.7 },
};

const mockRecentLeads = [
  { id: "1", name: "张三", company: "某科技有限公司", status: "NEW", createdAt: "2024-01-15" },
  { id: "2", name: "李四", company: "某贸易公司", status: "WORKING", createdAt: "2024-01-14" },
  { id: "3", name: "王五", company: "某制造企业", status: "QUALIFIED", createdAt: "2024-01-13" },
  { id: "4", name: "赵六", company: "某服务公司", status: "ASSIGNED", createdAt: "2024-01-12" },
];

const statusColors: Record<string, string> = {
  NEW: "blue",
  ASSIGNED: "cyan",
  WORKING: "green",
  INTERESTED: "orange",
  QUALIFIED: "purple",
  CONVERTED: "gold",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: alertSummary, isLoading: alertLoading, refetch } = useAlertSummary();

  const buildLeadAlertLink = (type: "first" | "next" | "inactive") => {
    const params = new URLSearchParams();
    if (type === "first") {
      params.set("alert", "first");
    } else if (type === "next") {
      params.set("alert", "next");
    } else {
      params.set("alert", "inactive");
      params.set("inactiveDays", String(alertSummary?.inactiveDays ?? 7));
    }
    return `/crm/leads?${params.toString()}`;
  };

  const buildOpportunityAlertLink = () => {
    const params = new URLSearchParams();
    params.set("staleDays", String(alertSummary?.staleDays ?? 7));
    return `/crm/opportunities?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title={t("dashboard.welcome", { name: user?.name || t("common.user") })}
        description={t("dashboard.description")}
      />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("dashboard.stats.leads")}
              value={mockStats.leads.total}
              prefix={<RocketOutlined style={{ color: "#1677ff" }} />}
              suffix={
                <Text type={mockStats.leads.growth > 0 ? "success" : "danger"} style={{ fontSize: 14 }}>
                  {mockStats.leads.growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.leads.growth)}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("dashboard.stats.opportunities")}
              value={mockStats.opportunities.total}
              prefix={<ShoppingCartOutlined style={{ color: "#52c41a" }} />}
              suffix={
                <Text type={mockStats.opportunities.growth > 0 ? "success" : "danger"} style={{ fontSize: 14 }}>
                  {mockStats.opportunities.growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.opportunities.growth)}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("dashboard.stats.quotes")}
              value={mockStats.quotes.total}
              prefix={<FileTextOutlined style={{ color: "#faad14" }} />}
              suffix={
                <Text type={mockStats.quotes.growth > 0 ? "success" : "danger"} style={{ fontSize: 14 }}>
                  {mockStats.quotes.growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.quotes.growth)}%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("dashboard.stats.tickets")}
              value={mockStats.tickets.total}
              prefix={<AlertOutlined style={{ color: "#ff4d4f" }} />}
              suffix={
                <Text type={mockStats.tickets.growth > 0 ? "danger" : "success"} style={{ fontSize: 14 }}>
                  {mockStats.tickets.growth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.tickets.growth)}%
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={t("dashboard.alerts.title")}
            extra={
              <Button size="small" onClick={() => refetch()} loading={alertLoading}>
                {t("common.refresh")}
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => router.push(buildLeadAlertLink("first"))}
                  style={{ cursor: "pointer" }}
                >
                  <Statistic
                    title={t("dashboard.alerts.first_overdue")}
                    value={alertSummary?.leadFirstFollowUpOverdue ?? 0}
                    prefix={<AlertOutlined style={{ color: "#fa8c16" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => router.push(buildLeadAlertLink("next"))}
                  style={{ cursor: "pointer" }}
                >
                  <Statistic
                    title={t("dashboard.alerts.next_overdue")}
                    value={alertSummary?.leadNextFollowUpOverdue ?? 0}
                    prefix={<AlertOutlined style={{ color: "#faad14" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => router.push(buildLeadAlertLink("inactive"))}
                  style={{ cursor: "pointer" }}
                >
                  <Statistic
                    title={t("dashboard.alerts.lead_inactive", { days: alertSummary?.inactiveDays ?? 7 })}
                    value={alertSummary?.leadInactive ?? 0}
                    prefix={<AlertOutlined style={{ color: "#f5222d" }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => router.push(buildOpportunityAlertLink())}
                  style={{ cursor: "pointer" }}
                >
                  <Statistic
                    title={t("dashboard.alerts.opportunity_stale", { days: alertSummary?.staleDays ?? 7 })}
                    value={alertSummary?.opportunityStale ?? 0}
                    prefix={<AlertOutlined style={{ color: "#cf1322" }} />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 最近线索 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={t("dashboard.recent_leads")}
            extra={<a onClick={() => router.push("/crm/leads")}>{t("common.view_all")}</a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={mockRecentLeads}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <a>{item.name}</a>
                        <Tag color={statusColors[item.status]}>{item.status}</Tag>
                      </Space>
                    }
                    description={item.company}
                  />
                  <Text type="secondary">{item.createdAt}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t("dashboard.quick_actions")}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Card size="small" hoverable onClick={() => router.push("/crm/leads/create")}>
                <Space>
                  <RocketOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                  <Text strong>{t("dashboard.actions.new_lead")}</Text>
                </Space>
              </Card>
              <Card size="small" hoverable onClick={() => router.push("/crm/opportunities")}>
                <Space>
                  <ShoppingCartOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                  <Text strong>{t("dashboard.actions.view_opportunities")}</Text>
                </Space>
              </Card>
              <Card size="small" hoverable onClick={() => router.push("/crm/quotes")}>
                <Space>
                  <FileTextOutlined style={{ fontSize: 20, color: "#faad14" }} />
                  <Text strong>{t("dashboard.actions.create_quote")}</Text>
                </Space>
              </Card>
              <Card size="small" hoverable onClick={() => router.push("/crm/tickets")}>
                <Space>
                  <AlertOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
                  <Text strong>{t("dashboard.actions.handle_ticket")}</Text>
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
