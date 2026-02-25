package service

import (
    "context"
    "fmt"
    "strings"
    "time"

    "github.com/gocolly/colly/v2"
)

type ScrapedJob struct {
    Title       string
    Company     string
    Description string
    Requirements string
    SalaryMin   *int
    SalaryMax   *int
    Platform    string
    RawText     string
}

func ScrapeJob(ctx context.Context, url string) (*ScrapedJob, error) {
    ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
    defer cancel()

    c := colly.NewCollector(
        colly.Async(true),
        colly.MaxDepth(1),
        colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
    )

    var job ScrapedJob
    var rawParts []string

    // Platform detection
    switch {
    case strings.Contains(url, "linkedin"):
        job.Platform = "linkedin"
    case strings.Contains(url, "glints"):
        job.Platform = "glints"
    case strings.Contains(url, "jobstreet"):
        job.Platform = "jobstreet"
    case strings.Contains(url, "kalibrr"):
        job.Platform = "kalibrr"
    default:
        job.Platform = "other"
    }

    // Ambil dari __NEXT_DATA__ (Next.js SPA seperti Glints, Kalibrr)
    c.OnHTML("script#__NEXT_DATA__", func(e *colly.HTMLElement) {
        if e.Text != "" {
            rawParts = append(rawParts, e.Text)
        }
    })

    // Ambil meta tag (sering berisi title/description di SPA)
    c.OnHTML("meta[property='og:title']", func(e *colly.HTMLElement) {
        if v := strings.TrimSpace(e.Attr("content")); v != "" {
            job.Title = v
        }
    })
    c.OnHTML("meta[property='og:description']", func(e *colly.HTMLElement) {
        if v := strings.TrimSpace(e.Attr("content")); v != "" && job.Description == "" {
            job.Description = v
        }
    })

    // Ambil <title> tag
    c.OnHTML("title", func(e *colly.HTMLElement) {
        if job.Title == "" {
            job.Title = strings.TrimSpace(e.Text)
        }
    })

    // Fallback: seluruh visible text di body
    c.OnHTML("body", func(e *colly.HTMLElement) {
        text := strings.TrimSpace(e.Text)
        if text != "" {
            rawParts = append(rawParts, text)
        }
    })

    if err := c.Visit(url); err != nil {
        return nil, fmt.Errorf("scrape failed: %w", err)
    }
    c.Wait()

    // Gabungkan semua raw text, truncate 8000 char untuk AI
    combined := strings.Join(rawParts, "\n")
    if len(combined) > 8000 {
        combined = combined[:8000]
    }
    job.RawText = combined

    return &job, nil
}
