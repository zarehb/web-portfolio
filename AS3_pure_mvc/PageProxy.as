package com.rocketbanner.designer.model.proxy
{
	import com.rocketbanner.designer.model.Exportable;
	import com.rocketbanner.designer.model.vo.BorderVO;
	import com.rocketbanner.designer.model.vo.Page;
	
	import mx.collections.ArrayCollection;
	
	import org.puremvc.as3.interfaces.IProxy;
	import org.puremvc.as3.patterns.proxy.Proxy;

	public class PageProxy extends Proxy implements IProxy,Exportable
	{
		public static const NAME:String = "pageProxy";
		
		private var pages:ArrayCollection;
		private var _activePage:Page;
		
		public function PageProxy()
		{
			//TODO this only deals with front for now
			super( NAME );
			pages = new ArrayCollection;
			var page:Page = createPage( Page.FRONT_PAGE );
			pages.addItem( page );
			activePage = page;
		}
		
		public function createPage( id:String ):Page
		{
			var page:Page = new Page( id );
			return page;
		}
		
		public function getPage( id:String ):Page
		{
			return pages.getItemAt(0) as Page;
		}
		
		public function export():XML
		{
			// TODO this only works with front, back also should be added
			return getPage( Page.FRONT_PAGE ).export();
		}
		
		public function importPages( pagesXML:XML ):void
		{
			pages = new ArrayCollection;
			if(!pagesXML)
			{
				throw new Error("pagesXML is null in PageProxy importimages");
				return;
			}
			for each( var page:XML in pagesXML.page )
			{
				var newPage:Page = createPage(page.@type);
				newPage.bgColor = page.@bgColor;
				
				var border:BorderVO = new BorderVO;
				border.width = Number(page.@borderWidth) / 12.5;
				border.color = page.@borderColor;
				border.type = page.@borderType;
				newPage.border = border;
				pages.addItem( newPage );
				activePage = newPage;
			}			
		}
		
		public function get activePage():Page
		{
			return _activePage;
		}

		public function set activePage(value:Page):void
		{
			_activePage = value;
		}
		
		public function setBorder( border:BorderVO, page:Page = null ):void
		{
			if( page )
			{
				page.border = border;
			}
			else if( activePage )
			{
				activePage.border = border;
			}
		}
		
		public function get bgColor():uint
		{
			return activePage.bgColor;
		}
		
		public function set bgColor(value:uint):void
		{
			activePage.bgColor = value;
		}
	}
	
}