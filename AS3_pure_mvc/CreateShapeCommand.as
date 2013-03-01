package com.rocketbanner.designer.controller.create
{
	import com.rocketbanner.designer.RocketBannerConstants;
	import com.rocketbanner.designer.canvas.view.RocketCanvasMediator;
	import com.rocketbanner.designer.controller.DeleteCommand;
	import com.rocketbanner.designer.model.AbstractItem;
	import com.rocketbanner.designer.model.ShapeItem;
	import com.rocketbanner.designer.model.proxy.ItemsProxy;
	import com.rocketbanner.designer.model.proxy.PageProxy;
	import com.rocketbanner.designer.model.proxy.RocketProxy;
	import com.rocketbanner.designer.model.vo.ShapeVO;
	import com.rocketbanner.designer.model.vo.UndoHelper;
	import com.rocketbanner.designer.propertyPanels.view.ShapePropertyPanelMediator;
	import com.rocketbanner.designer.view.mediator.ItemsMediator;
	
	import flash.geom.Point;
	
	import mx.controls.Alert;
	
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.utilities.undo.model.enum.UndoableCommandTypeEnum;

	public class CreateShapeCommand extends AbstractCreateCommand
	{
		protected var shapeVO:ShapeVO;
		protected var shapeItem:ShapeItem;
		
		public function CreateShapeCommand()
		{
		}
		
		override public function execute( notification:INotification ):void
		{
			super.execute( notification );
			var rocketProxy:RocketProxy = facade.retrieveProxy( RocketProxy.NAME ) as RocketProxy;
			if ( rocketProxy.grade == RocketBannerConstants.TEXT_GRADE )
			{
				 Alert.show( RocketBannerConstants.TEXT_GRADE_WARNING ); 
				 return;
			}
			var startingPoint:Point = notification.getBody() as Point;
			var shapePropertyPanelMediator:ShapePropertyPanelMediator = facade.retrieveMediator( ShapePropertyPanelMediator.NAME ) as ShapePropertyPanelMediator;
			var pageProxy:PageProxy = facade.retrieveProxy( PageProxy.NAME ) as PageProxy;
			var canvas:RocketCanvasMediator = facade.retrieveMediator( RocketCanvasMediator.NAME ) as RocketCanvasMediator;
			shapeItem.x = startingPoint.x;
			shapeItem.y = startingPoint.y;
			shapeVO.page = pageProxy.activePage;
			shapeVO.strokeColor = shapePropertyPanelMediator.strokeColor;
			shapeVO.fillColor = shapePropertyPanelMediator.fillColor;
			shapeVO.strokeAlpha = shapePropertyPanelMediator.strokeAlpha;
			shapeVO.fillAlpha = shapePropertyPanelMediator.fillAlpha;
			shapeVO.strokeWidth = shapePropertyPanelMediator.strokeWidth;
			shapeItem.elementVO = shapeVO;
			itemsProxy.addItem( shapeVO );
			itemsMediator.addItem( shapeItem );
			shapeItem.startDrawing();
			canvas.addItem( shapeItem );
			sendNotification( RocketBannerConstants.SYNC_DEPTHS );
			var undoObj:UndoHelper = new UndoHelper();
			undoObj.appliedObjects = [shapeVO];
			registerUndoObject(undoObj);
		}
		
	}
}