FROM nginx:alpine

ARG BUILD_DATE
LABEL build_date=$BUILD_DATE

RUN rm -rf /usr/share/nginx/html/*

COPY index.html /usr/share/nginx/html/

EXPOSE 80

