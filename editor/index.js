class Observable {
	
	constructor() {
		this.observers = []
	}
	
	notify(message) {
		this.observers.forEach((observer) => observer.update(message))
	}
	
}

class Pane extends Observable {
	
	constructor(title, supplier) {
		super()
		this.title = title
		this.supplier = supplier
		this.minimized = false
		this.supplier.observers.push(this)
	}
	
	installIn($container) {
		this.$container = $container.addClass(`pane pane-${this.title.toLowerCase()}`)
		this.$header = $('<div>').addClass('pane-header').appendTo(this.$container).text(this.title)
		this.$body = $('<div>').addClass('pane-body').appendTo(this.$container)
		this.$header.on('click', () => this.toggleMinimize())
	}
	
	toggleMinimize() {
		if (this.minimized) {
			this.minimized = false
			this.$container.removeClass('pane-minimized')
			this.$header.text(this.title)
		} else {
			this.minimized = true
			this.$container.addClass('pane-minimized')
			this.$header.text(this.title.substring(0, 1))
		}
	}
	
	async update(message) {
		this.$container.addClass('.pane-updating')
		await this.updateInternal(message)
		this.$container.removeClass('.pane-updating')
	}
	
	updateInternal(message) {
		
	}
	
}

class CodePane extends Pane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	installIn($container) {
		super.installIn($container)
		this.codeMirror = CodeMirror(this.$body[0], {
			lineNumbers: true
		})
		this.codeMirror.on('change', () => {
			if (this.changeScheduled) {
				clearTimeout(this.changeScheduled)
			}
			this.changeScheduled = setTimeout(() => {
				this.change(this.codeMirror.getValue())
				this.changeScheduled = null
			}, 300)
		})
	}
	
	change(code) {
		
	}
	
}

class SourcePane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	change(code) {
		this.notify(code)
	}
	
}

class GrammarPane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	updateInternal(message) {
		this.lastMessage = message
		this.notify(this.parser.parse(this.lastMessage))
	}
	
	change(code) {
		this.parser =  peg.generate(code)
		if (this.lastMessage) {
			this.updateInternal(this.lastMessage)
		}
	}
	
}

class AstPane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	updateInternal(message) {
		this.codeMirror.setValue(JSON.stringify(message, undefined, 2))
		this.notify(message)
	}
	
}

class CompilerPane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	updateInternal(message) {
		this.lastMessage = message
		this.notify(this.compile(this.lastMessage))
	}
	
	change(code) {
		this.compile =  eval(code)
		if (this.lastMessage) {
			this.updateInternal(this.lastMessage)
		}
	}
	
}

class WatPane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	updateInternal(message) {
		this.codeMirror.setValue(message)
		this.notify(message)
	}
	
}

class OutputPane extends CodePane {
	
	constructor(title, supplier) {
		super(title, supplier)
	}
	
	async updateInternal(wat) {
		let module = wabt.parseWat('test.wast', wat)
		module.resolveNames()
		module.validate()
		let binaryOutput = module.toBinary({
			log: true,
			write_debug_names: true
		})
		console.log(binaryOutput.log)
		let webAssembly = await WebAssembly.instantiate(binaryOutput.buffer, {
			imports: {
				imported_func: arg => console.log(arg)
			}
		})
		let result = webAssembly.instance.exports.main()
		this.codeMirror.setValue('' + result)
		this.notify(result)
	}
	
}

let root = new Observable()
let sourcePane = new SourcePane('Source', root)
let grammarPane = new GrammarPane('Grammar', sourcePane)
let astPane = new AstPane('AST', grammarPane)
let compilerPane = new CompilerPane('Compiler', astPane)
let watPane = new WatPane('WAT', compilerPane)
let outputPane = new OutputPane('Output', watPane)

const PANES = [
	sourcePane,
	grammarPane,
	astPane,
	compilerPane,
	watPane,
	outputPane
]

let installPanesIn = ($container) => {
	$container.addClass('panes')
	PANES.forEach((pane) => {
		pane.installIn($('<div>').appendTo($container))
	})
}

$(document).ready(() => {
	installPanesIn($('<div>').appendTo('body'))
})
