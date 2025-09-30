const entrada = require('prompt-sync')();

class Produto{
    constructor(
        private codigo: string,
        private nome: string,
        private preco: number,
        private quantidade: number
    ) {}

    //getter para atributos privados
    getCodigo(): string { return this.codigo;}
    getNome(): string {return this.nome;}
    getPreco(): number {return this.preco;}
    getQuantidade(): number {return this.quantidade;}

    //adiciona quantidade no estoque
    adicionar(qtd: number) {
        if (qtd <= 0) {
            throw new Error('Quantidade inválida');
        } this.quantidade += qtd;
    }

    //remove quantidade do estoque e verifica se é válido
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

//Classe abstrata (não pode ser instanciada diretamente)
//molde para Entrada e Saida

abstract class Movimentacao {
    constructor(
        protected produto: Produto,
        protected quantidade: number,
        protected data: Date = new Date()
    ) {}
    
    //método abstrato: cada filha (Entrada/Saida) implementa do seu jeito
    abstract aplicar(): void

    toString(): string {
        return `Produto: ${this.produto.getNome()} | Qtd: ${this.quantidade} | Data: ${this.data.toLocaleString()}`;
    }
} 

//classe filha para representar entrada de produtos no estoque
class Entrada extends Movimentacao{
    aplicar(): void {
        this.produto.adicionar(this.quantidade) //adiciona ao estoque
    }

    toString(): string {
        return `[Entrada] ${super.toString()}`
    }
}