import { RcFile } from "antd/lib/upload";

export const Convert = {
    date: (e: any) => {return e.$y + '-' + (e.$M + 1) + '-' + e.$D},
    time: (e: any) => {
        let hour = e.$H;
        let minute = e.$m;

        if (hour < 10) {
            hour = '0' + hour;
        }

        if (minute < 10) {
            minute = '0' + minute;
        }
        return hour + ':' + minute;
    },
    //Converter a data para o formato portugues (Padrao API)
    toBase64: async (file: any) => {
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as RcFile);
          reader.onload = () => resolve(reader.result as string);
        });
    },
};
