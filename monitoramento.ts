const promptSync = require("prompt-sync");
const entrada = promptSync();

const nome = entrada('Digite seu nome: ');
console.log(`Olá, ${nome}`);


class Produto{
    constructor(
        private codigo: string,
        private nome: string,
        private preco: number,
        private quantidade: number = 0,
        private limiteMinimo: number = 2
    ) {
        if (!codigo || !nome) {
            throw new Error('Código e nome obrigatórios.');
        }
        if (preco < 0) {
            throw new Error('Preço não pode ser negativo.');
        }
    }

    //getter para atributos privados
    getCodigo(): string { return this.codigo;}
    getNome(): string {return this.nome;}
    getPreco(): number {return this.preco;}
    getQuantidade(): number {return this.quantidade;}
    getLimiteMinimo(): number {return this.limiteMinimo;}

    //altera preço
    setPreco(novo: number) {
        if (novo < 0) {
            throw new Error('Preço inválido');
            this.preco = novo;
        }
    }

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

    //verifica se precisa fazer o alerta de estoque baixo
    verificarAlerta(): string | null {
        if (this.quantidade <= this.limiteMinimo) {
            return `⚠️ Estoque baixo: ${this.nome} (Código: ${this.codigo}) — Qtd: ${this.quantidade} <= Limite: ${this.limiteMinimo}`;
        } 
        return null
    }

    toString() {
        return `Código: ${this.codigo} | Nome: ${this.nome} | Preço: R$${this.preco.toFixed(2)} | Qtd: ${this.quantidade}}`
    }
}

//Classe abstrata (não pode ser instanciada diretamente)
//molde para Entrada e Saida

abstract class Movimentacao {
    constructor(
        protected produto: Produto,
        protected quantidade: number,
        protected data: Date = new Date()
    ) {
        if (!produto) {
            throw new Error('Movimentação sem produto');
        }
        if (!Number.isFinite(quantidade) || quantidade <= 0) {
            throw new Error('Quantidade da movimentação deve ser maior que 0.')
        }
    }
    
    //método abstrato: cada filha (Entrada/Saida) implementa do seu jeito
    abstract aplicar(): void
    abstract getTipo(): string

    toString(): string {
        return `${this.getTipo()} | Produto: ${this.produto.getNome()} | Qtd: ${this.quantidade} | Data: ${this.data.toLocaleString()}`;
    }
} 

//classe filha para representar entrada de produtos no estoque
class Entrada extends Movimentacao{
    aplicar(): void {
        this.produto.adicionar(this.quantidade) //adiciona ao estoque e lança erro se qtd inválida
    }

    getTipo(): string {
        return '[ENTRADA]'
    }

    toString(): string {
        return `${this.getTipo()} ${super.toString()}`
    }
}

class Saida extends Movimentacao{
    aplicar(): void {
        this.produto.remover(this.quantidade) //remove do estoque e lança erro se estoque insuficiente
    }

    getTipo(): string {
        return '[SAÍDA]'
    }

    toString(): string {
        return `${this.getTipo()} ${super.toString()}`
    }
}

//classe Estoque gerencia produtos + historico
class Estoque{
    private produtos = new Map<string, Produto>(); //chave = codigo
    private historico: Movimentacao[] = [];

     //cadastrar produto lança erro se já exisitir
     cadastrarProduto(p: Produto) {
        if (this.produtos.has(p.getCodigo())) {
            throw new Error('Produto já cadastrado');
        }
        this.produtos.set(p.getCodigo(), p);
     }
     
     //buscar produto, retorna ou lança erro
     buscarProduto(codigo: string): Produto {
        const p = this.produtos.get(codigo)
        if (!p) {
            throw new Error('Produto não encontrado.');
        } return p
     }

     //registrar entrada, cria movimentação, aplica e salva no hístorico
     registrarEntrada(codigo: string, qtd: number) {
        const p = this.buscarProduto(codigo)
        const ent = new Entrada(p, qtd)

        ent.aplicar(); //pode lançar error (validação)
        this.historico.push(ent)
     }

     //registar saída
     registrarSaida(codigo: string, qtd: number) {
        const p = this.buscarProduto(codigo)
        const s = new Saida(p, qtd)
        
        s.aplicar(); //pode lançar erro (estoque insuficiente)
        this.historico.push(s)
     }

     //listar todos os produtos com alerta quando estoque baixo
     listarProdutos() {
        console.log('\n*** Estoque atual ***')
        if (this.produtos.size === 0) {
            console.log('Nenhum produto cadastrado.');
            return
        }
        for (const p of this.produtos.values()) {
            console.log(p.toString());
            
            const alerta = p.verificarAlerta();
            if (alerta) console.log(alerta);
        }
     }

     //gerar relatório (estoque atual + histórico)
     gerarRelatorio() {
        this.listarProdutos();

        console.log('\n*** Histórico de movimentação (pelo mais recente) ***');
        if (this.historico.length === 0) {
            console.log('Nenhuma movimentação registrada');
            return
        }
        //mostrar do mais recente para o mais antigo
        [...this.historico].reverse().forEach(m => console.log(m.toString()));
     }

     //método para checar se já existe código
     existeProduto(codigo: string): boolean {
        return this.produtos.has(codigo);
     }
}

//função do menu para tratamento de erros
const estoque = new Estoque();

function cadastrarProduto() {
    let codigo: string;
    while (true) {
        try {
            codigo = entrada('Código do produto: ').trim();
            if (!codigo) throw new Error('Código obrigatório.');
            if (estoque.existeProduto(codigo)) throw new Error('Produto com este código já existe.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }

    let nome: string;
    while (true) {
        try {
            nome = entrada('Nome do produto: ').trim();
            if (!nome) throw new Error('Nome obrigatório.');
            if (!isNaN(Number(nome))) throw new Error('Nome inválido.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }

    let preco: number;
    while (true) {
        try {
            preco = parseFloat(entrada('Preço: '));
            if (isNaN(preco) || preco < 0) throw new Error('Preço inválido.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }

    let quantidade: number;
    while (true) {
        try {
            quantidade = parseInt(entrada('Quantidade de entrada: '));
            if (isNaN(quantidade) || quantidade <= 0) throw new Error('Quantidade inválida.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }

    const limiteMinimo = 5;
    const novo = new Produto(codigo, nome, preco, 0, limiteMinimo);
    estoque.cadastrarProduto(novo);
    estoque.registrarEntrada(codigo, quantidade);

    console.log('✅ Produto cadastrado com sucesso!');
}

function registrarEntrada() {
    while (true) {
        try {
            const codigo = entrada('Código do produto: ').trim();
            if (!estoque.existeProduto(codigo)) throw new Error('Produto não encontrado.');

            const qtd = parseInt(entrada('Quantidade de entrada: '));
            if (isNaN(qtd) || qtd <= 0) throw new Error('Quantidade inválida.');

            estoque.registrarEntrada(codigo, qtd);
            console.log('📦 Entrada registrada.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }
}

function registrarSaida() {
    while (true) {
        try {
            const codigo = entrada('Código do produto: ').trim();
            if (!estoque.existeProduto(codigo)) throw new Error('Produto não encontrado.');

            const qtd = parseInt(entrada('Quantidade de saída: '));
            if (isNaN(qtd) || qtd <= 0) throw new Error('Quantidade inválida.');

            estoque.registrarSaida(codigo, qtd);
            console.log('🚚 Saída registrada.');
            break;
        } catch (e: any) {
            console.log('❌', e.message);
        }
    }
}

//menu
let opcao: string;

while (true) {
    console.log("\n=== Sistema de Monitoramento de Estoque ===");
    console.log("1 - Cadastrar Produto");
    console.log("2 - Registrar Entrada");
    console.log("3 - Registrar Saída");
    console.log("4 - Listar Produtos");
    console.log("5 - Gerar Relatório de Estoque");
    console.log("0 - Sair");

    opcao = entrada('Escolha uma opção: ').trim();

    if (opcao === "0") {
        console.log("👋 Saindo do sistema...");
        break; // sai do while principal
    }

    switch (opcao) {
        case "1":
            cadastrarProduto(); // função já cuida das validações com while
            break;
        case "2":
            registrarEntrada(); // idem
            break;
        case "3":
            registrarSaida(); // idem
            break;
        case "4":
            estoque.listarProdutos();
            break;
        case "5":
            estoque.gerarRelatorio();
            break;
        default:
            console.log("⚠️ Opção inválida!");
    }
}
