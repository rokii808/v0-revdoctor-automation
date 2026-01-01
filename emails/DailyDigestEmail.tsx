import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components"

interface Car {
  title: string
  price: string
  verdict: string
  faultType: string
  risk: number
  reason: string
  url: string
}

interface DailyDigestEmailProps {
  items?: Car[]
  date?: string
  dealerName?: string
  variant?: "daily" | "preview"
}

export default function DailyDigestEmail({
  items = [],
  date = new Date().toLocaleDateString(),
  dealerName = "Dealer",
  variant = "daily",
}: DailyDigestEmailProps) {
  const isPreview = variant === "preview"

  return (
    <Html>
      <Head />
      <Preview>
        {`${isPreview ? "Preview: " : ""}Revvdoctor Daily Healthy Picks - ${items.length} cars for you today`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🚗 Revvdoctor Daily Healthy Picks</Heading>
            <Text style={headerSubtext}>Your AI-screened healthy cars for {date}</Text>
            {isPreview && <Text style={previewBadge}>🎯 PREVIEW MODE - This is a sample digest</Text>}
          </Section>

          {/* Intro */}
          <Section style={section}>
            <Text style={text}>
              Good morning{dealerName !== "Dealer" ? `, ${dealerName}` : ""}! Here are {items.length} healthy cars that
              match your preferences:
            </Text>
          </Section>

          {/* Car Cards */}
          {items.map((car, index) => (
            <Section key={index} style={carCard}>
              <Heading style={carTitle}>
                {index + 1}. {car.title}
              </Heading>

              <Section style={carDetails}>
                <div style={detailItem}>
                  <Text style={detailLabel}>Price</Text>
                  <Text style={priceValue}>{car.price}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>Issue Type</Text>
                  <Text style={detailValue}>{car.faultType}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>Risk Score</Text>
                  <Text style={riskValue}>{car.risk}/100</Text>
                </div>
              </Section>

              <Section style={reasonBox}>
                <Text style={reasonText}>
                  <strong>AI Analysis:</strong> {car.reason}
                </Text>
              </Section>

              <Link href={car.url} style={button}>
                View Listing →
              </Link>
            </Section>
          ))}

          {/* Why These Cars Section */}
          <Section style={infoBox}>
            <Heading style={h3}>Why These Cars Are Healthy:</Heading>
            <Text style={text}>✅ AI analyzed condition reports and found only minor, fixable issues</Text>
            <Text style={text}>✅ Risk scores below 25/100 indicate very low probability of major problems</Text>
            <Text style={text}>✅ All cars match your specified preferences for make, year, and budget</Text>
            <Text style={text}>✅ Direct links to auction listings for immediate bidding</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>You received this because you're subscribed to Revvdoctor daily scans.</Text>
            <Text style={footerText}>Revvdoctor - Screen Smarter. Buy Faster.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
}

const header = {
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "white",
  padding: "20px",
  textAlign: "center" as const,
}

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 10px",
  padding: "0",
}

const headerSubtext = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
}

const previewBadge = {
  backgroundColor: "#fbbf24",
  color: "#78350f",
  padding: "8px 16px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "10px auto 0",
  display: "inline-block",
}

const section = {
  padding: "20px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 10px",
}

const carCard = {
  border: "1px solid #e5e7eb",
  borderLeft: "4px solid #10b981",
  borderRadius: "8px",
  margin: "16px 20px",
  padding: "16px",
}

const carTitle = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px",
  color: "#111827",
}

const carDetails = {
  display: "flex",
  gap: "20px",
  margin: "12px 0",
}

const detailItem = {
  flex: "1",
}

const detailLabel = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0 0 4px",
}

const detailValue = {
  fontWeight: "600",
  fontSize: "14px",
  margin: "0",
  color: "#111827",
}

const priceValue = {
  ...detailValue,
  color: "#059669",
}

const riskValue = {
  ...detailValue,
  color: "#d97706",
}

const reasonBox = {
  backgroundColor: "#f3f4f6",
  padding: "12px",
  borderRadius: "4px",
  margin: "12px 0",
}

const reasonText = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  color: "#374151",
}

const button = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "10px 20px",
  textDecoration: "none",
  borderRadius: "4px",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
}

const infoBox = {
  margin: "30px 20px",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
}

const h3 = {
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
  color: "#111827",
}

const footer = {
  textAlign: "center" as const,
  padding: "20px",
  color: "#6b7280",
}

const footerText = {
  fontSize: "12px",
  margin: "5px 0",
  color: "#6b7280",
}
