#!/bin/sh
# Render each page of the resume PDF to assets/resume/page-N.png for the on-page resume panel.
# Run from the website folder after replacing the PDF:  sh tools/render_resume.sh Itak_Choi_Resume_Sep_2026.pdf
# Needs poppler (brew install poppler).

rm -f assets/resume/page-*.png
pdftoppm -png -scale-to-x 1700 -scale-to-y -1 "$1" assets/resume/page
ls assets/resume
