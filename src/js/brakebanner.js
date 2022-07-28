class BrakeBanner {
	constructor(selector) {
		// 创建一个应用
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xff0000
		});
		this.stage = this.app.stage;

		// 将视图添加到DOM中，会创建一个canvas元素
		document.querySelector(selector).appendChild(this.app.view);
	
		// 创建一个加载器用来加载全部资源并保存在resources中
		this.loader = new PIXI.Loader();
		this.loader.add("btn.png", "images/btn.png");
		this.loader.add("btn_circle.png", "images/btn_circle.png");
		this.loader.add("brake_bike.png", "images/brake_bike.png");
		this.loader.add("brake_handlerbar.png", "images/brake_handlerbar.png");
		this.loader.add("brake_lever.png", "images/brake_lever.png");
		this.loader.load();

		// 加载完成后开始显示
		this.loader.onComplete.add(() => {
			this.show();
		})
	}

	show() {
		let actionButton = this.createActionButton();

		// 移动整个容器的位置到网页视野中
		actionButton.x = actionButton.y = 400;
	}

	createActionButton() {
		// 使用容器来管理动效按钮
		let actionButton = new PIXI.Container();
		this.stage.addChild(actionButton);

		// 从加载器中取出按钮相关图片并放入容器中
		let btnImage = new PIXI.Sprite(this.loader.resources['btn.png'].texture);
		let btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		let btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		actionButton.addChild(btnImage);
		actionButton.addChild(btnCircle);
		actionButton.addChild(btnCircle2);

		// 改变按钮图片的圆心
		btnImage.pivot.x = btnImage.pivot.y = btnImage.width / 2;
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2;
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width / 2;

		// 给按钮的btnCircle添加动画，从0.8大小增大到1.3，该过程无限循环
		btnCircle.scale.x = btnCircle.scale.y = 0.8;
		gsap.to(btnCircle.scale, { duration: 1, x: 1.3, y: 1.3, repeat: -1 });
		gsap.to(btnCircle.scale, { duration: 1, alpha: 0, repeat: -1 });

		return actionButton;
	}
}
