import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule] // Asegúrate de incluir FormsModule aquí
})
export class AppComponent {
  title = 'trading-position-calculator';

  // Variables for calculations
  patrimonio: number | null = null;

  //riesgo
  riesgoPorcentaje: number = 0.005; // Default to beginner level
  precioCompra: number | null = null;
  stop: number | null = null;
  riesgoCalculado: number | null = null;

  //volatilidad
  volatilidadPorcentaje: number = 0.005; //Default to beginner level
  atr: number | null = null;
  volatilidadCalculada: number | null = null;

  //capital
  capitalPorcentaje: number = 0.01; //Default to beginner level
  capitalCalculado: number | null = null;

  calcularTodo(): void {
    this.calcularRiesgo();
    this.calcularVolatilidad();
    this.calcularCapital();

  }

  // Update risk calculation when input changes
  calcularRiesgo(): void {
    if (this.precioCompra !== null && this.stop !== null) {
      this.riesgoCalculado = (this.patrimonio * this.riesgoPorcentaje) / (this.precioCompra - this.stop);
    } else {
      this.riesgoCalculado = null;
    }
  }

// Update volatility calculation when input changes
  calcularVolatilidad(): void {
    if (this.atr !== null) {
      this.volatilidadCalculada = (this.patrimonio * this.volatilidadPorcentaje) / this.atr;
    } else {
      this.volatilidadCalculada = null;
    }
  }

// Update volatility calculation when input changes
  calcularCapital(): void {
    if (this.atr !== null) {
      this.capitalCalculado = (this.patrimonio * this.capitalPorcentaje) / this.precioCompra;
    } else {
      this.capitalCalculado = null;
    }
  }

  // Update the selected risk percentage
  actualizarRiesgoPorcentaje(valor: number): void {
    this.riesgoPorcentaje = valor;
    this.calcularRiesgo();
  }

  // Update the selected volatility percentage
  actualizarVolatilidadPorcentaje(valor: number): void {
    this.volatilidadPorcentaje = valor;
    this.calcularVolatilidad();
  }

  // Update the selected capital percentage
    actualizarCapitalPorcentaje(valor: number): void {
      this.capitalPorcentaje = valor;
      this.calcularCapital();
    }
}