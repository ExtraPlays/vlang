import { IExtension } from "../interfaces/IExtension";
import { Scope } from "../core/scope";

class DateExtension implements IExtension {
  registerExtension(scope: any): void {
    scope.define("date", (): string => {
      return new Date().toISOString();
    });

    scope.define("date_format", this.date_format);
    scope.define("date_diff", this.date_diff);
    scope.define("date_add", this.date_add);
  }

  // Função para formatar a data no padrão especificado ex date_format("DD/MM/YYYY HH:mm:ss", new Date())
  date_format(format: string, date: string): string {
    const dateObj = new Date(date);

    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds)
    ) {
      throw new Error("Invalid date");
    }

    return format
      .replace("DD", day.toString().padStart(2, "0"))
      .replace("MM", month.toString().padStart(2, "0"))
      .replace("YYYY", year.toString())
      .replace("HH", hours.toString().padStart(2, "0"))
      .replace("mm", minutes.toString().padStart(2, "0"))
      .replace("ss", seconds.toString().padStart(2, "0"));
  }

  // Função para retornar a diferença entre duas datas ex date_diff(new Date(), new Date())
  date_diff(date1: string, date2: string, unit: string): number {
    const dateObj1 = new Date(date1);
    const dateObj2 = new Date(date2);

    const diff = dateObj1.getTime() - dateObj2.getTime();

    switch (unit) {
      case "year":
        return Math.abs(dateObj1.getFullYear() - dateObj2.getFullYear());
      case "month":
        return Math.abs(
          dateObj1.getMonth() -
            dateObj2.getMonth() +
            12 * (dateObj1.getFullYear() - dateObj2.getFullYear())
        );
      case "day":
        return Math.abs(diff / (1000 * 60 * 60 * 24));
      case "hour":
        return Math.abs(diff / (1000 * 60 * 60));
      case "minute":
        return Math.abs(diff / (1000 * 60));
      case "second":
        return Math.abs(diff / 1000);
      default:
        throw new Error("Invalid unit");
    }
  }

  // Função para adicionar um valor a uma data ex date_add(new Date(), 1, "day")
  date_add(date: string, value: number, unit: string): string {
    const dateObj = new Date(date);

    switch (unit) {
      case "year":
        dateObj.setFullYear(dateObj.getFullYear() + value);
        break;
      case "month":
        dateObj.setMonth(dateObj.getMonth() + value);
        break;
      case "day":
        dateObj.setDate(dateObj.getDate() + value);
        break;
      case "hour":
        dateObj.setHours(dateObj.getHours() + value);
        break;
      case "minute":
        dateObj.setMinutes(dateObj.getMinutes() + value);
        break;
      case "second":
        dateObj.setSeconds(dateObj.getSeconds() + value);
        break;
      default:
        throw new Error("Invalid unit");
    }

    return dateObj.toISOString();
  }
}

export default DateExtension;
