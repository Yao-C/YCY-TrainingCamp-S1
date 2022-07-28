class BrakeBanner {
	constructor(selector) {
		// 创建一个应用
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff,
			resizeTo: window
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
		actionButton.x = 170;
		actionButton.y = 230;

		// 创建自行车容器
		let bikeContainer = new PIXI.Container();
		this.stage.addChild(bikeContainer);

		// 车身尺寸大，缩放容器大小使图片在页面可见
		bikeContainer.scale.x = bikeContainer.scale.y = 0.3;

		let bikeImage = new PIXI.Sprite(this.loader.resources['brake_bike.png'].texture);
		bikeContainer.addChild(bikeImage);

		let bikeLeverImage = new PIXI.Sprite(this.loader.resources['brake_lever.png'].texture);
		bikeContainer.addChild(bikeLeverImage);

		// 设置刹车杆旋转的轴心，为之后刹车动效做准备
		bikeLeverImage.pivot.x = 455;
		bikeLeverImage.pivot.y = 455;

		// 设置刹车杆位置到与车把手相连，没有尺寸可在ps中量一下
		bikeLeverImage.x = 722;
		bikeLeverImage.y = 900;

		let bikeHandlerbarImage = new PIXI.Sprite(this.loader.resources['brake_handlerbar.png'].texture);
		bikeContainer.addChild(bikeHandlerbarImage);


		this.stage.addChild(actionButton);
		actionButton.interactive = true; // 具备与用户交互的能力
		actionButton.buttonMode = true;  // 鼠标移动到按钮会出现小手的图标

		// 添加按钮事件，点击刹车，松开不刹
		actionButton.on("mousedown", () => {
			// bikeLeverImage.rotation = Math.PI / 180 * -30; // 按刹车效果
			// 用gasp效果后，刹车更逼真
			gsap.to(bikeLeverImage, { duration: 0.6, rotation: Math.PI / 180 * -30 });
		})
		actionButton.on("mouseup", () => {
			// bikeLeverImage.rotation = 0; 
			gsap.to(bikeLeverImage, { duration: 0.6, rotation: 0 });
		})

    // 使自行车根据窗口大小而调节，一直处于窗口右下角
		let resize = () => {
			bikeContainer.x = window.innerWidth - bikeContainer.width;
			bikeContainer.y = window.innerHeight - bikeContainer.height;
		}
		window.addEventListener('resize', resize);
		resize();
	}

	createActionButton() {
		// 使用容器来管理动效按钮
		let actionButton = new PIXI.Container();
		actionButton.scale.x = actionButton.scale.y = 0.4;

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
