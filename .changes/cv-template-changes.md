# CV Template CSS Changes

## 1. Contact Row — Centred alignment
**Property changed:** `justify-content`
```css
.contact-row {
  justify-content: center;
}
```

## 2. Contact Row — Hyperlinked items styled in teal
**Property changed:** `color` on anchor tags, added `:hover` underline
```css
.contact-row a {
  color: hsl(187, 74%, 32%);
  text-decoration: none;
}

.contact-row a:hover {
  text-decoration: underline;
}
```
**Agent contract:** populate links as `<a href="mailto:{{EMAIL}}">Email</a>`, `<a href="{{LINKEDIN_URL}}">LinkedIn</a>`, `<a href="{{PORTFOLIO_URL}}">GitHub</a>`

## 3. Education — Bold sub-labels (Modules, Dissertation)
**Rule added:** `.edu-desc strong` and `.edu-desc b`
```css
.edu-desc strong,
.edu-desc b {
  font-weight: 600;
  color: #333;
}
```
**Agent contract:** wrap sub-labels in `<strong>Modules</strong>` or `<strong>Dissertation</strong>` inside `.edu-desc`

## 4. Projects — Bullet points always enforced
**Rules added:** `.project-desc ul`, `.project-desc li`
```css
.project-desc ul {
  padding-left: 18px;
  margin-top: 4px;
}

.project-desc li {
  list-style-type: disc;
  font-size: 10.5px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 4px;
}
```
**Agent contract:** wrap project bullets inside `<div class="project-desc"><ul><li>...</li></ul></div>`

## 5. Page Break Rules — Replaced
**Old rule removed:**
```css
.avoid-break,
.job,
.project,
.edu-item,
.cert-item {
  break-inside: avoid;
  page-break-inside: avoid;
}
```
**New rules:**
```css
.avoid-break, .job, .project, .edu-item, .cert-item {
  break-inside: avoid;
  page-break-inside: avoid;
}

.project-header, .job-header, .edu-header {
  break-after: avoid;
  page-break-after: avoid;
}

.section-title {
  break-after: avoid;
  page-break-after: avoid;
}

.section {
  page-break-inside: auto;
}
```
