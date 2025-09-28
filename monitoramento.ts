const entrada = require('prompt-sync')();

class Produto{
    constructor(
        private codigo: string,
        private nome: string,
        private preco: number,
        private quantidade: number
    ) {}

    getCodigo(): string { return this.codigo;}
    getNome(): string {return this.nome;}
    getPreco(): number {return this.preco;}
    getQuantidade(): number {return this.quantidade;}

    adicionar(qtd: number) {
        if (qtd <= 0) {
            throw new Error('Quantidade inválida');
        } this.quantidade += qtd;
    }

    remover(qtd: number) {
        if (qtd <= 0) {
            throw new Error('Quantidade inválida');
        }
        if (qtd > this.quantidade) {
            throw new Error('Estoque insuficiente!');
        } this.quantidade -= qtd
    }

    toString() {
        return `Código: ${this.codigo} - ${this.nome} | R$${this.preco} | Estoque: ${this.quantidade}}`
    }
}