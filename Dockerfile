FROM quay.io/ukhomeofficedigital/nodejs-base:v8
RUN yum clean all && yum update -y -q && yum clean all && yum -y upgrade
RUN yum install -y wget fontconfig freetype libX11 libXext libXrender libjpeg libpng openssl xorg-x11-fonts-75dpi xorg-x11-fonts-Type1

RUN wget https://downloads.wkhtmltopdf.org/0.12/0.12.5/wkhtmltox-0.12.5-1.centos7.x86_64.rpm && \
    rpm -Uvh wkhtmltox-0.12.5-1.centos7.x86_64.rpm

RUN mkdir /public

COPY package.json /app/package.json
RUN npm --loglevel warn install --production  --no-optional
COPY . /app
RUN npm --loglevel warn run postinstall
RUN chown -R nodejs:nodejs /public

USER 999

CMD ["/app/run.sh"]
