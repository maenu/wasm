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
		this.$header = $('<div>').addClass('pane-header').appendTo(this.$container)
		this.$title = $('<span>').appendTo(this.$header).text(this.title)
		this.$body = $('<div>').addClass('pane-body').appendTo(this.$container)
		this.$header.on('click', () => this.toggleMinimize())
	}
	
	toggleMinimize() {
		if (this.minimized) {
			this.minimized = false
			this.$container.removeClass('pane-minimized')
			this.$title.text(this.title)
		} else {
			this.minimized = true
			this.$container.addClass('pane-minimized')
			this.$title.text(this.title.substring(0, 1))
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
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier)
		this.extension = extension
		this.mode = mode
	}
	
	installIn($container) {
		super.installIn($container)
		this.$load = $('<a href="#">').text('load').appendTo(this.$header)
		this.$load.on('click', (event) => {
			event.preventDefault()
			event.stopPropagation()
			this.load()
		})
		this.$save = $('<a href="#">').text('save').appendTo(this.$header)
		this.$save.on('click', () => {
			event.preventDefault()
			event.stopPropagation()
			this.save()
		})
		this.codeMirror = CodeMirror(this.$body[0], {
			lineNumbers: true,
			mode: this.mode
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
	
	load() {
		let input = document.createElement('input')
		input.type = 'file'
		input.addEventListener('change', () => {
			if (!input.files[0]){
				return
			}
			let reader = new FileReader()
			reader.onloadend = (event) => {
				if (event.target.readyState != FileReader.DONE) {
					return
				}
				this.codeMirror.setValue(event.target.result)
			}
			reader.readAsText(input.files[0]);
		})
		input.style.display = 'none'
		document.body.appendChild(input)
		input.click()
	}
	
	save() {
		let blob = new Blob([this.codeMirror.getValue()], {
			type:'text/plain'
		})
		let anchor = document.createElement('a')
		anchor.download = `${this.title.toLowerCase()}.${this.extension}`
		anchor.innerHTML = 'download'
		anchor.href = window.URL.createObjectURL(blob)
		anchor.style.display = 'none'
		document.body.appendChild(anchor)
		anchor.click()
	}
	
}

class SourcePane extends CodePane {
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
	}
	
	change(code) {
		this.notify(code)
	}
	
}

class GrammarPane extends CodePane {
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
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
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
	}
	
	updateInternal(message) {
		this.codeMirror.setValue(JSON.stringify(message, undefined, 2))
		this.notify(message)
	}
	
}

class CompilerPane extends CodePane {
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
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
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
	}
	
	updateInternal(message) {
		this.codeMirror.setValue(message)
		this.notify(message)
	}
	
}

class OutputPane extends CodePane {
	
	constructor(title, supplier, extension, mode) {
		super(title, supplier, extension, mode)
	}
	
	async updateInternal(wat) {
		let module = wabt.parseWat('test.wast', wat)
		module.resolveNames()
		module.validate()
		let binaryOutput = module.toBinary({
			log: true,
			write_debug_names: true
		})
		let webAssembly = await WebAssembly.instantiate(binaryOutput.buffer)
		let result = webAssembly.instance.exports.main()
		this.codeMirror.setValue('' + result)
		this.notify(result)
	}
	
}

let root = new Observable()
let sourcePane = new SourcePane('Source', root, 'source')
let grammarPane = new GrammarPane('Grammar', sourcePane, 'pegjs', 'pegjs')
let astPane = new AstPane('AST', grammarPane, 'json', 'json')
let compilerPane = new CompilerPane('Compiler', astPane, 'js', 'javascript')
let watPane = new WatPane('WAT', compilerPane, 'wat', 'wast')
let outputPane = new OutputPane('Output', watPane, 'txt')

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
