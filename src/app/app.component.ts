import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class AppComponent {
  title = 'trading-position-calculator';

  patrimonio: number | null = null;

  riesgoPorcentaje: number = 0.005;
  precioCompra: number | null = null;
  stop: number | null = null;
  riesgoCalculado: number | null = null;

  volatilidadPorcentaje: number = 0.005;
  atr: number | null = null;
  volatilidadCalculada: number | null = null;

  capitalPorcentaje: number = 0.01;
  capitalCalculado: number | null = null;

  calcularTodo(): void {
    this.calcularRiesgo();
    this.calcularVolatilidad();
    this.calcularCapital();
  }

  calcularRiesgo(): void {
    if (this.patrimonio !== null && this.precioCompra !== null && this.stop !== null) {
      this.riesgoCalculado = (this.patrimonio * this.riesgoPorcentaje) / (this.precioCompra - this.stop);
    } else {
      this.riesgoCalculado = null;
    }
  }

  calcularVolatilidad(): void {
    if (this.patrimonio !== null && this.atr !== null) {
      this.volatilidadCalculada = (this.patrimonio * this.volatilidadPorcentaje) / this.atr;
    } else {
      this.volatilidadCalculada = null;
    }
  }

  calcularCapital(): void {
    if (this.patrimonio !== null && this.precioCompra !== null) {
      this.capitalCalculado = (this.patrimonio * this.capitalPorcentaje) / this.precioCompra;
    } else {
      this.capitalCalculado = null;
    }
  }
}
