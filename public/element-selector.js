
// public/element-selector.js
(function() {
  // Only initialize if this app is embedded
  if (!window.location.search.includes('embedded=true')) return;

  console.log("Element selector script initialized");

  let selectionModeEnabled = false;
  let highlightOverlay = null;
  let selectionOverlay = null;
  let selectionBlocker = null;
  let currentHoveredElement = null;
  let currentSelectedElement = null;
  
  // Initialize after DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - initializing element selector");
    
    // Create a style for highlighting elements
    const style = document.createElement('style');
    style.textContent = `
      .element-overlay {
        position: fixed;
        pointer-events: none;
        z-index: 49;
        transition: all 0.2s ease;
      }
      
      .hover-overlay {
        border: 2px solid rgba(0, 112, 243, 0.7);
        background-color: rgba(0, 112, 243, 0.1);
      }
      
      // .selection-overlay {
      //   border: 2px solid rgba(255, 64, 64, 0.7);
      //   background-color: rgba(255, 64, 64, 0.1);
      //   z-index: 48; /* Below hover overlay */
      // }
      
      // .hover-highlight {
      //   outline: 2px dashed rgba(249, 115, 22, 0.7) !important;
      //   outline-offset: 1px !important;
      // }
      
      .selection-highlight {
        outline: 2px solid rgba(255, 64, 64, 0.7) !important;
        outline-offset: 1px !important;
      }
      
      body.selection-mode * {
        cursor: crosshair !important;
      }
      
      .selection-blocker {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 47;
        cursor: crosshair;
        background: transparent;
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    // Create hover highlight overlay element
    highlightOverlay = document.createElement('div');
    highlightOverlay.className = 'element-overlay hover-overlay';
    highlightOverlay.style.display = 'none';
    document.body.appendChild(highlightOverlay);
    
    // Create selection overlay element
    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'element-overlay selection-overlay';
    selectionOverlay.style.display = 'none';
    document.body.appendChild(selectionOverlay);
    
    // Create a selection blocker overlay to capture all clicks
    selectionBlocker = document.createElement('div');
    selectionBlocker.className = 'selection-blocker';
    selectionBlocker.id = 'selection-blocker';
    document.body.appendChild(selectionBlocker);
    
    // Listen for messages from parent window
    window.addEventListener('message', (event) => {
      console.log("Message received from parent:", event.data);
      
      // Make sure to validate the origin in production
      // For testing, accept all origins
      // const expectedOrigin = new URL(document.referrer).origin;
      // if (event.origin !== expectedOrigin) return;
      
      const { type, data } = event.data;
      
      if (type === 'TOGGLE_SELECTION_MODE') {
        selectionModeEnabled = data.enabled;
        console.log("Selection mode toggled to:", selectionModeEnabled);
        
        if (selectionModeEnabled) {
          // Enable selection mode
          document.body.classList.add('selection-mode');
          selectionBlocker.style.display = 'block';
        } else {
          // Disable selection mode
          document.body.classList.remove('selection-mode');
          selectionBlocker.style.display = 'none';
          
          // Remove hover highlights when disabling, but keep selection
          removeHoverHighlight();
          highlightOverlay.style.display = 'none';
        }
      } else if (type === 'CLEAR_SELECTION') {
        // Clear selection when explicitly requested
        clearSelection();
      }
    });
    
    // Set up event listeners for hovering and selecting elements
    selectionBlocker.addEventListener('mousemove', handleMouseMove);
    selectionBlocker.addEventListener('click', handleClick);
    
    console.log("Element selector initialization complete");
  });
  
  // Get the element under the cursor, temporarily hiding the blocker
  function getElementUnderCursor(x, y) {
    if (!selectionBlocker) {
      console.error("Selection blocker not initialized yet");
      return document.elementFromPoint(x, y);
    }
    
    // Temporarily hide the selection blocker to find the actual element beneath
    const originalDisplay = selectionBlocker.style.display;
    selectionBlocker.style.display = 'none';
    
    // Get the element at the coordinates
    const element = document.elementFromPoint(x, y);
    
    // Restore the selection blocker
    selectionBlocker.style.display = originalDisplay;
    
    console.log("Element under cursor:", element ? `${element.tagName}${element.id ? '#'+element.id : ''}` : "none");
    
    return element;
  }
  
  function handleMouseMove(event) {
    if (!selectionModeEnabled) return;
    
    // Get the element under the cursor using our helper function
    const element = getElementUnderCursor(event.clientX, event.clientY);
    console.log("Mousemove detected, element:", element ? element.tagName : "none");
    
    if (!element || element === highlightOverlay || element === selectionOverlay) return;
    
    // Don't process if it's the same element we're already hovering
    if (element === currentHoveredElement) return;
    
    // Remove previous hover highlight
    removeHoverHighlight();
    
    // Add highlight to the current element
    element.classList.add('hover-highlight');
    currentHoveredElement = element;
    
    // Position the hover highlight overlay
    positionOverlay(highlightOverlay, element);
    
    // Send information about the hovered element to the parent
    sendElementInfo(element, 'ELEMENT_HOVERED');
    console.log("Element hovered:", element.tagName, element.className);
  }
  
  function handleClick(event) {
    console.log("Click detected in selection mode");
    if (!selectionModeEnabled) return;
    
    // Always prevent default and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Get the element that was clicked using our helper function
    const element = getElementUnderCursor(event.clientX, event.clientY);
    console.log("Clicked element:", element ? element.tagName : "none");
    
    if (!element || element === highlightOverlay || element === selectionOverlay) {
      console.log("Invalid element for selection");
      return;
    }
    
    // Clear previous selection if there was one
    if (currentSelectedElement) {
      currentSelectedElement.classList.remove('selection-highlight');
    }
    
    // Set new selection
    currentSelectedElement = element;
    element.classList.add('selection-highlight');
    
    // Position the selection overlay
    positionOverlay(selectionOverlay, element);
    selectionOverlay.style.display = 'block';
    
    // Send information about the selected element to the parent
    sendElementInfo(element, 'ELEMENT_SELECTED');
    console.log("Element selected:", element.tagName, element.className);
    
    return false;
  }
  
  function positionOverlay(overlay, element) {
    const rect = element.getBoundingClientRect();
    console.log("Positioning overlay for element:", element.tagName, "Rect:", rect);
    
    overlay.style.display = 'block';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
  }
  
  function removeHoverHighlight() {
    // Remove highlight class from currently hovered element
    if (currentHoveredElement) {
      currentHoveredElement.classList.remove('hover-highlight');
      currentHoveredElement = null;
    }
    
    // Alternative approach: remove from all elements that might have it
    const highlighted = document.querySelectorAll('.hover-highlight');
    highlighted.forEach(el => el.classList.remove('hover-highlight'));
  }
  
  function clearSelection() {
    // Remove selection class from selected element
    if (currentSelectedElement) {
      currentSelectedElement.classList.remove('selection-highlight');
      currentSelectedElement = null;
    }
    
    // Hide selection overlay
    selectionOverlay.style.display = 'none';
    
    // Notify parent that selection has been cleared
    window.parent.postMessage({
      type: 'ELEMENT_DESELECTED',
      data: null
    }, '*');
  }
  
  function sendElementInfo(element, eventType) {
    try {
      // Get element information to send to parent, handling SVG elements specially
      const className = typeof element.className === 'string' 
        ? element.className 
        : (element.className.baseVal || ''); // Handle SVGAnimatedString
      
      const elementInfo = {
        tagName: element.tagName.toLowerCase(),
        id: element.id || null,
        classes: className,
        attributes: Array.from(element.attributes).map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        container: element.closest('[data-component]').getAttribute('data-component'),
        textContent: element.textContent?.trim() || null,
        rect: {
          top: element.getBoundingClientRect().top,
          right: element.getBoundingClientRect().right,
          bottom: element.getBoundingClientRect().bottom,
          left: element.getBoundingClientRect().left,
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
          x: element.getBoundingClientRect().x,
          y: element.getBoundingClientRect().y
        }
      };
      
      // Log the message we're sending
      console.log("Sending message to parent:", eventType, elementInfo);
      
      // Send message to parent
      window.parent.postMessage({
        type: eventType,
        data: elementInfo
      }, '*');
    } catch (error) {
      console.error("Error sending element info:", error);
      console.log("Sending simplified element info");
      // Send a simplified version with just the basics
      try {
        window.parent.postMessage({
          type: eventType,
          data: {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            textContent: (element.textContent || '').substring(0, 100),
            container: element.closest('[data-component]').getAttribute('data-component'),
            rect: {
              width: element.getBoundingClientRect().width,
              height: element.getBoundingClientRect().height
            }
          }
        }, '*');
      } catch (fallbackError) {
        console.error("Even simplified data couldn't be sent:", fallbackError);
      }
    }
  }
  
  // Adding an immediate check in case DOMContentLoaded already fired
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log("Document already loaded, initializing immediately");
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  }
  
  // Notify parent when iframe is fully loaded and ready
  window.addEventListener('load', function() {
    let attempts = 0;
    const maxAttempts = 10; // Increase max attempts since we're checking for content
    const checkInterval = 300; // 300ms between attempts
    
    function checkPageContentAndNotify() {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} to check page content`);
      
      try {
        // Check if the page has loaded actual content
        // You can customize this check to look for specific elements or text
        const hasContent = document.body && 
          document.body.innerHTML.length > 500 &&
          !document.body.innerHTML.includes("is running but there's no service running on port")

        if (hasContent) {
          console.log("Page content detected, notifying parent");

          window.parent.postMessage({
            type: 'IFRAME_READY',
            data: { 
              url: window.location.href,
              title: document.title,
              contentFound: true
            }
          }, '*');
          attempts = maxAttempts;
          console.log("Parent notification sent successfully");
        } else {
          console.log("Expected content not found yet");
          setTimeout(checkPageContentAndNotify, checkInterval);
        }
      } catch (error) {
        console.error("Error checking page content:", error);
        
        // If we haven't reached max attempts, try again
        if (attempts < maxAttempts) {
          setTimeout(checkPageContentAndNotify, checkInterval);
        }
      }
    }
    
    // Start the first attempt after a short delay
    setTimeout(checkPageContentAndNotify, 100);
  });
})();
