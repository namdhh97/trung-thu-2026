# Mobile Responsive QA – v16

Hard-reset mobile rules are appended at the end of `public/css/style.css` so they override historical responsive rules.

Target portrait widths:
- 320x568
- 360x740 / 360x800
- 375x812
- 390x844
- 393x852
- 412x915
- 430x932
- 440x956 (iPhone 16 Pro Max emulation)

Target landscape / short viewports:
- 844x390
- 852x393
- 915x412
- 932x430

Checks:
- Header stays fully visible and centered.
- CUNG TRĂNG never overlaps header.
- Palace scene remains above the action dock.
- Four bottom actions always remain inside viewport in a 2x2 dock on portrait phones.
- Guide toggle and guide bubble sit above the action dock.
- Character bubbles fit within viewport.
- Company fortune image is fully contained and not cropped.
- Guest fortune, wish form, wish history, lucky voucher are scrollable through the modal viewport.
- Safe-area insets are respected.
- Landscape phones use a compact 4-button row.
